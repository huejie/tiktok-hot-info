// pages/detail/detail.js
const app = getApp();

Page({
  data: {
    id: '',
    item: null,
    regionName: '',
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    if (!id) {
      this.setData({ loading: false });
      return;
    }

    this.setData({ id });
    this.loadDetail();
  },

  // 加载详情
  async loadDetail() {
    this.setData({ loading: true });

    try {
      const res = await this.request(`/hot/${this.data.id}`);
      if (res.success) {
        const item = res.data;

        // 获取地区名称
        const regions = await this.request('/region');
        let regionName = '北美';
        if (regions.success) {
          const region = regions.data.find(r => r.id === item.region);
          regionName = region ? region.name : '北美';
        }

        this.setData({
          item,
          regionName
        });
      }
    } catch (error) {
      console.error('加载详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 分享
  shareItem() {
    const { item, regionName } = this.data;
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 生成海报
  generatePoster() {
    const { item } = this.data;
    if (!item) return;

    wx.showLoading({ title: '生成中...' });

    this.request('/poster/generate', {
      method: 'POST',
      data: {
        hotItems: [item],
        region: this.data.regionName
      }
    }).then(res => {
      wx.hideLoading();
      if (res.success) {
        wx.showToast({
          title: '海报生成成功',
          icon: 'success'
        });
        // TODO: 跳转到海报预览或保存到相册
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    });
  },

  // 分享到好友
  onShareAppMessage() {
    const { item, regionName } = this.data;
    return {
      title: item ? item.title : 'TikTok热点资讯',
      path: `/pages/detail/detail?id=${this.data.id}`,
      imageUrl: item ? item.coverImage : ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { item } = this.data;
    return {
      title: item ? item.title : 'TikTok热点资讯',
      imageUrl: item ? item.coverImage : ''
    };
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
