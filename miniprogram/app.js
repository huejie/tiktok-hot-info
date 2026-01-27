// app.js
App({
  globalData: {
    // API 基础地址
    apiBase: 'http://localhost:3000/api',

    // 当前选择的地区
    currentRegion: '',

    // 地区列表
    regions: [],

    // 行业列表
    industries: []
  },

  onLaunch() {
    console.log('TikTok B2B 工厂信息小程序启动');
    // 初始化数据
    this.initData();
  },

  async initData() {
    try {
      // 获取地区列表
      const regionRes = await this.request('/region');
      if (regionRes.success) {
        this.globalData.regions = regionRes.data;
        console.log('地区列表加载成功:', this.globalData.regions.length, '个地区');
      }

      // 获取行业列表
      const industryRes = await this.request('/hot/industries');
      if (industryRes.success) {
        this.globalData.industries = industryRes.data;
        console.log('行业列表加载成功:', this.globalData.industries.length, '个行业');
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
    }
  },

  // 封装请求方法
  request(url, options = {}) {
    const { method = 'GET', data = {}, header = {} } = options;

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBase + url,
        method,
        data,
        header: {
          'content-type': 'application/json',
          ...header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          console.error('请求错误:', url, error);
          reject(error);
        }
      });
    });
  },

  // 设置当前地区
  setCurrentRegion(region) {
    this.globalData.currentRegion = region;
    wx.setStorageSync('currentRegion', region);
  },

  // 获取当前地区
  getCurrentRegion() {
    let region = this.globalData.currentRegion;
    if (!region) {
      region = wx.getStorageSync('currentRegion') || '';
      this.globalData.currentRegion = region;
    }
    return region;
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
  }
});
