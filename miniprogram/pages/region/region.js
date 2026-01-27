// pages/region/region.js
const app = getApp();

Page({
  data: {
    regions: [],
    currentRegion: ''
  },

  onLoad() {
    this.setData({
      currentRegion: app.getCurrentRegion()
    });
    this.loadRegions();
  },

  // 加载地区列表
  async loadRegions() {
    try {
      const res = await this.request('/region');
      if (res.success) {
        this.setData({ regions: res.data });
      }
    } catch (error) {
      console.error('加载地区失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 选择地区
  selectRegion(e) {
    const id = e.currentTarget.dataset.id;
    app.setCurrentRegion(id);
    this.setData({ currentRegion: id });

    wx.showToast({
      title: '已切换地区',
      icon: 'success'
    });

    // 返回首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 500);
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
