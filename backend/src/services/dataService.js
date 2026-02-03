// B2B工厂信息数据服务
const { FactoryInfo, MockDataGenerator } = require('../models/FactoryInfo');
const config = require('../config');
const tiktokCrawler = require('./crawler/tikTokCrawler');
const tiktokDataService = require('./tiktokDataService');

class DataService {
  /**
   * 按行业和地区搜索工厂信息
   * @param {string} industry - 行业ID
   * @param {string} region - 地区ID
   * @param {number} limit - 返回数量
   * @param {string} source - 数据源 ('mock' | 'tiktok' | 'hybrid')
   */
  async searchFactories(industry, region = null, limit = 20, source = config.dataSource || 'mock') {
    // 使用真实 TikTok 数据
    if (source === 'tiktok' || source === 'hybrid') {
      try {
        const tiktokData = await this.getTikTokTrendingData(region, limit);
        if (tiktokData.length > 0) {
          // 按热度排序
          tiktokData.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
          return tiktokData.slice(0, limit);
        }
      } catch (error) {
        console.warn('获取 TikTok 数据失败，回退到 Mock 数据:', error.message);
      }
    }

    // Demo 阶段：使用 Mock 数据（默认或回退）
    const regions = region ? [region] : Object.keys(config.regions);
    const items = [];

    for (const r of regions) {
      const regionItems = MockDataGenerator.generateFactoryInfo(r, industry, Math.ceil(limit / regions.length));
      items.push(...regionItems);
    }

    // 按出口潜力排序
    items.sort((a, b) => b.getExportPotential() - a.getExportPotential());

    return items;
  }

  /**
   * 获取 TikTok Creative Center 热门数据
   * @param {string} region - 地区代码 (us, gb, ca, etc.)
   * @param {number} limit - 返回数量
   */
  async getTikTokTrendingData(region = 'us', limit = 20) {
    try {
      // 检查 API 服务是否可用
      await tiktokCrawler.healthCheck();

      const regionCode = this.mapRegionToTikTok(region);
      const data = [];

      // 获取热门标签
      try {
        const hashtags = await tiktokCrawler.getTrendingHashtags({
          region: regionCode,
          period: 7
        });
        data.push(...hashtags.slice(0, Math.ceil(limit / 3)));
      } catch (error) {
        console.warn('获取热门标签失败:', error.message);
      }

      // 获取热门视频
      try {
        const videos = await tiktokCrawler.getTrendingVideos({
          region: regionCode,
          period: 7
        });
        data.push(...videos.slice(0, Math.ceil(limit / 3)));
      } catch (error) {
        console.warn('获取热门视频失败:', error.message);
      }

      // 获取热门音乐
      try {
        const songs = await tiktokCrawler.getTrendingSongs({
          region: regionCode,
          period: 7
        });
        data.push(...songs.slice(0, Math.ceil(limit / 3)));
      } catch (error) {
        console.warn('获取热门音乐失败:', error.message);
      }

      return data;
    } catch (error) {
      console.error('获取 TikTok 数据失败:', error.message);
      return [];
    }
  }

  /**
   * 将内部地区代码映射到 TikTok 地区代码
   * @param {string} region - 内部地区代码
   */
  mapRegionToTikTok(region) {
    const regionMap = {
      'north-america': 'us',
      'europe': 'gb',
      'asia': 'jp',
      'southeast-asia': 'sg',
      'south-america': 'br'
    };
    return regionMap[region] || region || 'us';
  }

  /**
   * 搜索 TikTok 内容（工厂/产品相关）
   * @param {string} keyword - 搜索关键词
   * @param {string} type - 内容类型 (video, hashtag, sound, user)
   * @param {number} count - 返回数量
   */
  async searchTikTokContent(keyword, type = 'video', count = 20) {
    try {
      await tiktokCrawler.healthCheck();
      const results = await tiktokCrawler.search(keyword, {
        type,
        count,
        region: 'us'
      });
      return results;
    } catch (error) {
      console.error('搜索 TikTok 内容失败:', error.message);
      return [];
    }
  }

  /**
   * 获取工厂详情
   * @param {string} id - 工厂ID
   */
  async getFactoryDetail(id) {
    // Demo 阶段
    const parts = id.split('-');
    const region = parts[0] || 'north-america';
    const industry = parts[1] || 'textile';
    const items = await this.searchFactories(industry, region, 100);
    return items.find(item => item.id === id) || null;
  }

  /**
   * 按地区获取各行业数据概览
   */
  async getRegionIndustryOverview() {
    const regions = this.getRegions();
    const industries = this.getIndustries();
    const overview = {};

    for (const region of regions) {
      overview[region.id] = {
        region: region.name,
        industries: {}
      };

      for (const industry of industries) {
        const items = await this.searchFactories(industry.id, region.id, 50);

        overview[region.id].industries[industry.id] = {
          name: industry.name,
          totalFactories: items.length,
          totalViews: items.reduce((sum, item) => sum + item.stats.views, 0),
          totalInquiries: items.reduce((sum, item) => sum + item.stats.inquiryCount, 0),
          avgExportScore: items.length > 0
            ? (items.reduce((sum, item) => sum + item.getExportPotential(), 0) / items.length).toFixed(1)
            : 0,
          hotFactories: items.filter(item => item.isHot()).length,
          recommendation: this.getRecommendation(items, industry.id)
        };
      }
    }

    return overview;
  }

  /**
   * 获取推荐
   */
  getRecommendation(items, industry) {
    if (items.length === 0) return '暂无数据';

    const avgViews = items.reduce((sum, item) => sum + item.stats.views, 0) / items.length;
    const avgInquiries = items.reduce((sum, item) => sum + item.stats.inquiryCount, 0) / items.length;

    if (avgViews > 100000 && avgInquiries > 200) {
      return '高度推荐 - 市场活跃，询盘量大';
    } else if (avgViews > 50000 && avgInquiries > 100) {
      return '推荐 - 有一定市场基础';
    } else if (avgViews > 20000) {
      return '可考虑 - 市场处于发展期';
    } else {
      return '需评估 - 市场尚待开发';
    }
  }

  /**
   * 获取爆款产品列表
   */
  async getHotProducts(industry = null, limit = 10) {
    const industries = industry ? [industry] : config.industries.map(i => i.id);
    const products = [];

    for (const ind of industries) {
      const items = await this.searchFactories(ind, null, 20);
      const hotProducts = items
        .filter(item => item.hotProduct)
        .map(item => ({
          ...item.hotProduct,
          factoryName: item.factory.name,
          industry: ind,
          stats: {
            views: item.stats.views,
            inquiries: item.stats.inquiryCount
          }
        }));

      products.push(...hotProducts);
    }

    // 按热度排序
    products.sort((a, b) => b.stats.views - a.stats.views);
    return products.slice(0, limit);
  }

  /**
   * 生成每周报告
   */
  async generateWeeklyReport() {
    const regions = this.getRegions();
    const industries = this.getIndustries();
    const report = {
      week: this.getCurrentWeek(),
      generatedAt: new Date().toISOString(),
      highlights: [],
      regionAnalysis: {},
      industryTrends: {},
      recommendations: []
    };

    // 地区分析
    for (const region of regions) {
      const allItems = [];
      for (const industry of industries) {
        const items = await this.searchFactories(industry.id, region.id, 20);
        allItems.push(...items);
      }

      report.regionAnalysis[region.id] = {
        name: region.name,
        totalFactories: allItems.length,
        totalViews: allItems.reduce((sum, item) => sum + item.stats.views, 0),
        topIndustry: this.getTopIndustry(allItems, industries),
        hotCount: allItems.filter(item => item.isHot()).length
      };
    }

    // 行业趋势
    for (const industry of industries) {
      const allItems = await this.searchFactories(industry.id, null, 50);

      report.industryTrends[industry.id] = {
        name: industry.name,
        totalFactories: allItems.length,
        avgViews: allItems.length > 0
          ? Math.floor(allItems.reduce((sum, item) => sum + item.stats.views, 0) / allItems.length)
          : 0,
        hotProducts: allItems.filter(item => item.hotProduct).length
      };
    }

    // 爆款产品
    report.hotProducts = await this.getHotProducts(null, 5);

    // 推荐亮点
    report.highlights = [
      `本周共收集 ${Object.values(report.regionAnalysis).reduce((sum, r) => sum + r.totalFactories, 0)} 家工厂信息`,
      `最活跃地区：${this.getMostActiveRegion(report.regionAnalysis)}`,
      `最热门行业：${this.getMostPopularIndustry(report.industryTrends)}`
    ];

    return report;
  }

  getMostActiveRegion(regionAnalysis) {
    let max = 0;
    let result = '';
    for (const [id, data] of Object.entries(regionAnalysis)) {
      if (data.totalViews > max) {
        max = data.totalViews;
        result = data.name;
      }
    }
    return result;
  }

  getMostPopularIndustry(industryTrends) {
    let max = 0;
    let result = '';
    for (const [id, data] of Object.entries(industryTrends)) {
      if (data.avgViews > max) {
        max = data.avgViews;
        result = data.name;
      }
    }
    return result;
  }

  getTopIndustry(items, industries) {
    const counts = {};
    items.forEach(item => {
      counts[item.industry] = (counts[item.industry] || 0) + 1;
    });

    let max = 0;
    let result = '';
    for (const [id, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        const industry = industries.find(i => i.id === id);
        result = industry ? industry.name : id;
      }
    }
    return result;
  }

  getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    const end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  }

  /**
   * 获取所有地区
   */
  getRegions() {
    return Object.entries(config.regions).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  /**
   * 获取所有行业
   */
  getIndustries() {
    return config.industries;
  }

  /**
   * 获取地区列表
   */
  async getRegionList() {
    return this.getRegions();
  }

  /**
   * 获取行业列表
   */
  async getIndustryList() {
    return this.getIndustries();
  }
}

module.exports = new DataService();
