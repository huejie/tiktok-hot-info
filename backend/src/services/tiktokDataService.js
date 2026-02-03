// TikTok 数据服务 - 使用真实 TikTok API 数据
const tikTokCrawler = require('./crawler/tikTokCrawler');
const config = require('../config');

class TikTokDataService {
  /**
   * 地区代码映射
   * 将应用的地区 ID 映射到 TikTok Creative Center 地区代码
   */
  regionMapping = {
    'north-america': 'us',
    'europe': 'gb',
    'southeast-asia': 'sg',
    'africa': 'za'
  };

  /**
   * 行业关键词映射
   */
  industryKeywords = {
    'textile': ['clothing', 'fashion', 'textile', 'garment', 'apparel', 'dress', 'shirt'],
    'electronics': ['electronics', 'tech', 'gadget', 'phone', 'usb', 'charger', 'digital'],
    'machinery': ['machinery', 'manufacturing', 'equipment', 'industrial', 'factory', 'production'],
    'chemical': ['chemical', 'plastic', 'rubber', 'material', 'synthetic'],
    'home': ['home', 'furniture', 'decor', 'household', 'kitchen', 'living'],
    'food': ['food', 'beverage', 'snack', 'drink', 'kitchen', 'cooking'],
    'auto': ['auto', 'car', 'vehicle', 'parts', 'automotive', 'accessories'],
    'construction': ['construction', 'building', 'material', 'hardware', 'tools']
  };

  /**
   * 获取热点数据（包含所有类型）
   */
  async getHotData(regionId = 'north-america', limit = 20) {
    const regionCode = this.getRegionCode(regionId);
    const period = 7; // 最近7天

    try {
      const [hashtags, songs, videos] = await Promise.all([
        tikTokCrawler.getTrendingHashtags({ region: regionCode, period }),
        tikTokCrawler.getTrendingSongs({ region: regionCode, period }),
        tikTokCrawler.getTrendingVideos({ region: regionCode, period })
      ]);

      // 合并并转换数据格式
      const items = [
        ...hashtags.slice(0, Math.floor(limit / 3)).map(item => this.transformHashtag(item, regionId)),
        ...songs.slice(0, Math.floor(limit / 3)).map(item => this.transformSong(item, regionId)),
        ...videos.slice(0, Math.floor(limit / 3) + 1).map(item => this.transformVideo(item, regionId))
      ];

      return items;
    } catch (error) {
      console.error('获取 TikTok 热点数据失败:', error.message);
      throw new Error(`无法获取热点数据: ${error.message}`);
    }
  }

  /**
   * 按行业搜索相关内容
   */
  async searchByIndustry(industryId, regionId = 'north-america', limit = 20) {
    const regionCode = this.getRegionCode(regionId);
    const keywords = this.industryKeywords[industryId] || [industryId];
    const items = [];

    for (const keyword of keywords.slice(0, 3)) {
      try {
        const results = await tikTokCrawler.search(keyword, {
          type: 'video',
          count: Math.ceil(limit / 3),
          region: regionCode
        });

        const transformed = results
          .filter(item => item.stats && item.stats.views >= 50000) // 至少5万播放
          .map(item => this.transformVideo(item, regionId, industryId));

        items.push(...transformed);
      } catch (error) {
        console.error(`搜索关键词 "${keyword}" 失败:`, error.message);
      }
    }

    return items.slice(0, limit);
  }

  /**
   * 获取单个热点详情
   */
  async getHotItemDetail(id) {
    const [type, tiktokId] = id.split('_');

    try {
      if (type === 'video') {
        // 通过搜索获取视频详情（API 限制，暂时实现简化版）
        const results = await tikTokCrawler.search('', { type: 'video', count: 100 });
        return results.find(v => v.id === tiktokId) || null;
      }

      return null;
    } catch (error) {
      console.error('获取热点详情失败:', error.message);
      throw new Error(`无法获取详情: ${error.message}`);
    }
  }

  /**
   * 获取热门标签
   */
  async getTrendingHashtags(regionId = 'north-america', limit = 20) {
    const regionCode = this.getRegionCode(regionId);

    try {
      const hashtags = await tikTokCrawler.getTrendingHashtags({
        region: regionCode,
        period: 7
      });

      return hashtags.slice(0, limit).map(item => this.transformHashtag(item, regionId));
    } catch (error) {
      console.error('获取热门标签失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取热门视频
   */
  async getTrendingVideos(regionId = 'north-america', limit = 20) {
    const regionCode = this.getRegionCode(regionId);

    try {
      const videos = await tikTokCrawler.getTrendingVideos({
        region: regionCode,
        period: 7
      });

      return videos.slice(0, limit).map(item => this.transformVideo(item, regionId));
    } catch (error) {
      console.error('获取热门视频失败:', error.message);
      throw error;
    }
  }

  /**
   * 搜索工厂相关内容
   */
  async searchFactories(industry, regionId = null, limit = 20) {
    const regions = regionId ? [regionId] : Object.keys(config.regions);
    const allItems = [];

    const factoryKeywords = [
      'factory', 'manufacturer', 'wholesale', 'supplier',
      'made in china', 'production line', 'warehouse'
    ];

    for (const regionId of regions) {
      const regionCode = this.getRegionCode(regionId);

      // 添加行业关键词
      const industryKeywords = this.industryKeywords[industry] || [];
      const searchKeywords = [...factoryKeywords, ...industryKeywords.slice(0, 2)];

      for (const keyword of searchKeywords.slice(0, 4)) {
        try {
          const results = await tikTokCrawler.search(keyword, {
            type: 'video',
            count: Math.ceil(limit / searchKeywords.length),
            region: regionCode
          });

          const transformed = results
            .filter(item => item.stats && item.stats.views >= 100000)
            .map(item => this.transformFactoryVideo(item, regionId, industry));

          allItems.push(...transformed);
        } catch (error) {
          console.error(`搜索 "${keyword}" 失败:`, error.message);
        }
      }
    }

    // 按播放量排序
    allItems.sort((a, b) => b.stats.views - a.stats.views);
    return allItems.slice(0, limit);
  }

  /**
   * 转换标签数据
   */
  transformHashtag(item, regionId) {
    return {
      id: `hashtag_${item.id}`,
      type: 'hashtag',
      title: item.title,
      description: `#${item.title} - ${item.description || ''}`,
      coverImage: item.coverImage || '',
      stats: {
        views: item.stats?.views || 0,
        videos: item.stats?.videos || 0,
        growth: item.stats?.growth || 0
      },
      region: regionId,
      industry: null,
      hotProduct: null,
      factory: null,
      url: item.url || '',
      collectedAt: item.collectedAt
    };
  }

  /**
   * 转换音乐数据
   */
  transformSong(item, regionId) {
    return {
      id: `song_${item.id}`,
      type: 'song',
      title: item.title,
      description: item.description || '',
      coverImage: item.coverImage || '',
      stats: {
        views: item.stats?.views || 0,
        videos: item.stats?.videos || 0,
        growth: item.stats?.growth || 0
      },
      video: {
        url: item.audioUrl || '',
        duration: 0
      },
      region: regionId,
      industry: null,
      hotProduct: null,
      factory: null,
      url: '',
      collectedAt: item.collectedAt
    };
  }

  /**
   * 转换视频数据
   */
  transformVideo(item, regionId, industry = null) {
    // 提取产品信息
    const hotProduct = this.extractProductInfo(item);

    return {
      id: `video_${item.id}`,
      type: 'video',
      title: item.title,
      description: item.description,
      coverImage: item.coverImage,
      stats: {
        views: item.stats?.views || 0,
        likes: item.stats?.likes || 0,
        comments: item.stats?.comments || 0,
        shares: item.stats?.shares || 0,
        growth: item.stats?.growth || 0
      },
      video: item.video || {},
      author: item.author || {},
      music: item.music || {},
      region: regionId,
      industry,
      hotProduct,
      factory: null,
      url: item.url || '',
      collectedAt: item.collectedAt
    };
  }

  /**
   * 转换工厂视频数据
   */
  transformFactoryVideo(item, regionId, industry) {
    const baseData = this.transformVideo(item, regionId, industry);

    // 提取工厂信息
    const factory = this.extractFactoryInfo(item);

    baseData.factory = factory;
    baseData.type = 'factory';

    return baseData;
  }

  /**
   * 提取产品信息
   */
  extractProductInfo(video) {
    const desc = (video.description || '').toLowerCase();
    const title = (video.title || '').toLowerCase();

    // 检测产品类型
    const productTypes = {
      'beauty': ['makeup', 'cosmetic', 'skincare', 'beauty', 'lipstick', 'serum', 'cream'],
      'home': ['kitchen', 'decor', 'furniture', 'gadget', 'organizer', 'home'],
      'electronics': ['phone', 'tech', 'usb', 'charger', 'digital', 'electronics'],
      'clothing': ['dress', 'shirt', 'fashion', 'wear', 'clothing', 'apparel'],
      'toys': ['toy', 'kids', 'children', 'game', 'play'],
      'kitchen': ['kitchen', 'cooking', 'bakeware', 'utensil']
    };

    let category = '';
    for (const [cat, keywords] of Object.entries(productTypes)) {
      if (keywords.some(kw => desc.includes(kw) || title.includes(kw))) {
        category = cat;
        break;
      }
    }

    // 提取价格
    const pricePattern = /\$[\d,]+(?:\.\d{2})?|USD\s*\d+/g;
    const priceMatch = desc.match(pricePattern);
    const price = priceMatch ? priceMatch[0] : '';

    return {
      name: this.extractProductName(title, desc),
      category,
      price,
      potential: this.calculatePotential(video.stats),
      description: video.description?.substring(0, 200) || ''
    };
  }

  /**
   * 提取工厂信息
   */
  extractFactoryInfo(video) {
    const desc = (video.description || '').toLowerCase();

    const factoryIndicators = {
      isFactory: desc.includes('factory') || desc.includes('manufacturer'),
      isWholesale: desc.includes('wholesale') || desc.includes('bulk'),
      isExport: desc.includes('export') || desc.includes('worldwide'),
      hasCapacity: desc.includes('capacity') || desc.includes('production')
    };

    const type = [];
    if (factoryIndicators.isFactory) type.push('Direct Factory');
    if (factoryIndicators.isWholesale) type.push('Wholesaler');
    if (factoryIndicators.isExport) type.push('Exporter');

    return {
      name: video.author?.nickname || video.author?.username || '',
      location: '',
      type: type.join(' ') || 'Unknown',
      confidence: factoryIndicators.isFactory ? 0.8 : 0.4
    };
  }

  /**
   * 提取产品名称
   */
  extractProductName(title, desc) {
    // 简单的提取逻辑，可以优化
    const words = title.split(' ').filter(w => w.length > 3);
    return words.slice(0, 5).join(' ') || '热门产品';
  }

  /**
   * 计算产品潜力
   */
  calculatePotential(stats) {
    if (!stats) return 'medium';

    const engagementRate = (stats.likes + stats.comments + stats.shares) / (stats.views || 1);

    if (engagementRate > 0.15) return 'high';
    if (engagementRate > 0.08) return 'medium';
    return 'low';
  }

  /**
   * 获取地区代码
   */
  getRegionCode(regionId) {
    return this.regionMapping[regionId] || 'us';
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      await tikTokCrawler.healthCheck();
      return { status: 'ok', message: 'TikTok API 服务正常' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = new TikTokDataService();
