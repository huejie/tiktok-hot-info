// pages/index/index.js
const app = getApp();

Page({
  data: {
    industries: [],
    regions: [],
    currentIndustry: '',
    currentIndustryName: '',
    currentRegion: '',
    searchKeyword: '',
    factories: [],
    hotProducts: [],
    overview: false,
    overviewData: [],
    loading: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 刷新数据
    if (this.data.currentIndustry) {
      this.loadFactories();
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载初始数据
  async loadData() {
    this.setData({ loading: true });

    try {
      // 加载行业列表
      const industryRes = await this.request('/hot/industries');
      if (industryRes.success) {
        this.setData({ industries: industryRes.data });
      }

      // 加载地区列表
      const regionRes = await this.request('/region');
      if (regionRes.success) {
        this.setData({ regions: regionRes.data });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 选择行业
  async selectIndustry(e) {
    const id = e.currentTarget.dataset.id;
    const industry = this.data.industries.find(i => i.id === id);

    this.setData({
      currentIndustry: id,
      currentIndustryName: industry ? industry.name : '',
      loading: true
    });

    await this.loadFactories();
    await this.loadHotProducts();
    await this.loadOverview();
  },

  // 选择地区
  async selectRegion(e) {
    const region = e.currentTarget.dataset.region;
    this.setData({ currentRegion: region });
    await this.loadFactories();
  },

  // 搜索
  async onSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      });
      return;
    }

    // 查找匹配的行业
    const matchedIndustry = this.data.industries.find(i =>
      i.name.includes(keyword) || i.keywords.some(k => keyword.includes(k))
    );

    if (matchedIndustry) {
      this.selectIndustry({
        currentTarget: { dataset: { id: matchedIndustry.id } }
      });
    } else {
      wx.showToast({
        title: '未找到相关行业',
        icon: 'none'
      });
    }
  },

  // 加载工厂列表
  async loadFactories() {
    if (!this.data.currentIndustry) return;

    try {
      const params = {
        industry: this.data.currentIndustry,
        limit: 50
      };
      if (this.data.currentRegion) {
        params.region = this.data.currentRegion;
      }

      const res = await this.request('/hot/search', { method: 'GET', data: params });

      if (res.success) {
        const factories = res.data.map(item => ({
          ...item,
          isHot: item.stats.views > 100000 || item.stats.inquiryCount > 200,
          exportScore: this.calculateExportScore(item)
        }));

        this.setData({ factories });
      }
    } catch (error) {
      console.error('加载工厂失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载爆款产品
  async loadHotProducts() {
    if (!this.data.currentIndustry) return;

    try {
      const res = await this.request('/hot/products', {
        method: 'GET',
        data: {
          industry: this.data.currentIndustry,
          limit: 10
        }
      });

      if (res.success) {
        this.setData({ hotProducts: res.data });
      }
    } catch (error) {
      console.error('加载爆款产品失败:', error);
    }
  },

  // 加载概览数据
  async loadOverview() {
    if (!this.data.currentIndustry) return;

    try {
      const res = await this.request('/hot/overview');

      if (res.success) {
        const overviewData = [];

        for (const [regionId, data] of Object.entries(res.data)) {
          const industryData = data.industries[this.data.currentIndustry];
          if (industryData) {
            overviewData.push({
              region: data.region,
              regionId,
              totalFactories: industryData.totalFactories,
              totalViews: industryData.totalViews,
              totalInquiries: industryData.totalInquiries,
              avgExportScore: industryData.avgExportScore,
              recommendation: industryData.recommendation,
              recommendationClass: this.getRecommendationClass(industryData.recommendation)
            });
          }
        }

        this.setData({
          overview: true,
          overviewData
        });
      }
    } catch (error) {
      console.error('加载概览失败:', error);
    }
  },

  // 计算出口潜力评分
  calculateExportScore(item) {
    let score = 0;
    if (item.stats.views > 50000) score += 20;
    if (item.stats.inquiryCount > 100) score += 30;
    if (item.export.targetCountries.length > 3) score += 20;
    if (item.factory.certifications.length > 0) score += 15;
    if (item.hotProduct) score += 15;
    return score;
  },

  // 获取推荐样式
  getRecommendationClass(recommendation) {
    if (recommendation.includes('高度推荐')) return 'high';
    if (recommendation.includes('推荐')) return 'medium';
    if (recommendation.includes('可考虑')) return 'low';
    return 'unknown';
  },

  // 查看每周报告
  async viewWeeklyReport() {
    wx.showLoading({ title: '生成中...' });

    try {
      const res = await this.request('/hot/weekly-report');

      wx.hideLoading();

      if (res.success) {
        // 跳转到报告页面
        wx.navigateTo({
          url: `/pages/report/report?data=${encodeURIComponent(JSON.stringify(res.data))}`
        });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 跳转详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 格式化数字
  formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // 封装请求
  request(url, options = {}) {
    return app.request(url, options);
  }
});
