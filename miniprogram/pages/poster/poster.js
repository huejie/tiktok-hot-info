// pages/poster/poster.js - 完善版海报生成
const app = getApp();

Page({
  data: {
    itemId: '',
    item: null,
    regionName: '',
    currentTemplate: 'business',
    templates: [
      { id: 'business', name: '商务专业', icon: '💼' },
      { id: 'minimal', name: '极简风格', icon: '✨' },
      { id: 'gradient', name: '渐变潮流', icon: '🔥' },
      { id: 'factory', name: '工厂推荐', icon: '🏭' },
      { id: 'product', name: '产品展示', icon: '📦' }
    ],
    loading: false,
    canvasWidth: 750,
    canvasHeight: 1334  // iPhone 屏幕比例
  },

  onLoad(options) {
    const { id, region } = options;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({ itemId: id, regionName: region || '未知地区' });
    this.loadItemData();
  },

  async loadItemData() {
    wx.showLoading({ title: '加载中...' });

    try {
      const res = await this.request(`/hot/${this.data.itemId}`);
      if (res.success) {
        this.setData({ item: res.data });
        // Canvas 准备好后绘制海报
        setTimeout(() => this.initCanvas(), 200);
      }
    } catch (error) {
      console.error('加载失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async initCanvas() {
    const { item, regionName, currentTemplate } = this.data;

    try {
      // 获取 Canvas 2D 上下文
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res[0] || !res[0].node) {
            console.error('Canvas 节点获取失败');
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          // 设置 Canvas 尺寸
          const dpr = wx.getSystemInfoSync().pixelRatio;
          const canvasWidth = 750;
          const canvasHeight = 1334;  // 更高的海报，适配更多内容

          canvas.width = canvasWidth * dpr;
          canvas.height = canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          this.canvas = canvas;
          this.ctx = ctx;
          this.dpr = dpr;

          // 预加载图片（如果有封面图）
          if (item?.video?.coverImage || item?.coverImage) {
            await this.loadCoverImage(item.video?.coverImage || item.coverImage);
          }

          // 绘制海报
          this.drawPoster();
        });
    } catch (error) {
      console.error('Canvas 初始化失败:', error);
      wx.showToast({ title: '初始化失败', icon: 'none' });
    }
  },

  // 预加载网络图片
  async loadCoverImage(url) {
    return new Promise((resolve, reject) => {
      const image = this.canvas.createImage();
      image.onload = () => {
        this.coverImage = image;
        resolve(image);
      };
      image.onerror = () => {
        console.warn('封面图加载失败');
        resolve(null);
      };
      image.src = url.startsWith('http') ? url : `https:${url}`;
    });
  },

  drawPoster() {
    const { item, regionName, currentTemplate } = this.data;
    const ctx = this.ctx;
    const { canvasWidth, canvasHeight } = this.data;

    // 清空 Canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 根据模板选择绘制样式
    switch (currentTemplate) {
      case 'business':
        this.drawBusinessStyle(ctx, item, regionName, canvasWidth, canvasHeight);
        break;
      case 'minimal':
        this.drawMinimalStyle(ctx, item, regionName, canvasWidth, canvasHeight);
        break;
      case 'gradient':
        this.drawGradientStyle(ctx, item, regionName, canvasWidth, canvasHeight);
        break;
      case 'factory':
        this.drawFactoryStyle(ctx, item, regionName, canvasWidth, canvasHeight);
        break;
      case 'product':
        this.drawProductStyle(ctx, item, regionName, canvasWidth, canvasHeight);
        break;
      default:
        this.drawBusinessStyle(ctx, item, regionName, canvasWidth, canvasHeight);
    }

    // 生成临时图片
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      success: (res) => {
        this.posterPath = res.tempFilePath;
      },
      fail: (err) => {
        console.error('生成临时图片失败:', err);
      }
    });
  },

  // 商务专业风格（增强版）
  drawBusinessStyle(ctx, item, regionName, width, height) {
    const padding = 50;
    let currentY = padding;

    // 背景 - 白色
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 顶部装饰条 - 使用渐变
    const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
    headerGradient.addColorStop(0, '#0369A1');
    headerGradient.addColorStop(1, '#0EA5E9');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 16);

    // Logo 区域
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TB 热点资讯', padding, currentY + 12);

    // 右上角日期
    ctx.fillStyle = '#64748B';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(this.formatDate(), width - padding, currentY + 12);
    currentY += 60;

    // 地区标签
    const regionBadgeWidth = 160;
    const regionBadgeX = (width - regionBadgeWidth) / 2;
    this.drawRoundedRect(ctx, regionBadgeX, currentY, regionBadgeWidth, 48, 24);
    ctx.fillStyle = '#F1F5F9';
    ctx.fill();
    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(regionName, width / 2, currentY + 32);
    currentY += 80;

    // 分割线
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(padding, currentY);
    ctx.lineTo(width - padding, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    currentY += 50;

    // 封面图（如果有）
    if (this.coverImage) {
      const imgWidth = width - padding * 2;
      const imgHeight = 360;
      this.drawRoundedRect(ctx, padding, currentY, imgWidth, imgHeight, 12);
      ctx.save();
      ctx.clip();
      ctx.drawImage(this.coverImage, padding, currentY, imgWidth, imgHeight);
      ctx.restore();

      // 图片边框
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.stroke();

      currentY += imgHeight + 40;
    }

    // 标题
    ctx.fillStyle = '#020617';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'left';
    const titleLines = this.wrapText(ctx, item.title || item.description || '暂无标题', width - padding * 2, 40);
    titleLines.forEach((line) => {
      ctx.fillText(line, padding, currentY);
      currentY += 50;
    });
    currentY += 30;

    // 数据卡片
    const stats = [
      { label: '播放量', value: this.formatNumber(item.stats?.views || 0), icon: '👁️' },
      { label: '点赞数', value: this.formatNumber(item.stats?.likes || 0), icon: '❤️' },
      { label: '评论数', value: this.formatNumber(item.stats?.comments || 0), icon: '💬' },
      { label: '增长率', value: `+${item.stats?.growth || 0}%`, icon: '📈' }
    ];

    const cardPadding = 30;
    const cardY = currentY;
    const rowHeight = 100;
    const colWidth = (width - padding * 2 - cardPadding * 3) / 2;

    // 绘制两行数据卡片
    stats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = padding + cardPadding / 2 + col * (colWidth + cardPadding);
      const y = cardY + row * (rowHeight + cardPadding);

      // 卡片背景
      this.drawRoundedRect(ctx, x, y, colWidth, rowHeight, 12);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 图标
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(stat.icon, x + 20, y + 35);

      // 数值
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(stat.value, x + 70, y + 35);

      // 标签
      ctx.fillStyle = '#64748B';
      ctx.font = '22px sans-serif';
      ctx.fillText(stat.label, x + 20, y + 75);
    });

    currentY = cardY + rowHeight * 2 + cardPadding + 50;

    // 工厂信息（如果有）
    if (item.factory?.name) {
      const factoryY = currentY;
      const factoryHeight = 100;

      this.drawRoundedRect(ctx, padding, factoryY, width - padding * 2, factoryHeight, 12);
      ctx.fillStyle = '#EFF6FF';
      ctx.fill();

      ctx.fillStyle = '#0369A1';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🏭 ${item.factory.name}`, padding + 20, factoryY + 35);

      ctx.fillStyle = '#475569';
      ctx.font = '24px sans-serif';
      ctx.fillText(`规模：${item.factory.scale || '未知'}`, padding + 20, factoryY + 70);

      currentY = factoryY + factoryHeight + 40;
    }

    // 爆款产品（如果有）
    if (item.hotProduct) {
      const productY = currentY;
      const productHeight = 100;

      this.drawRoundedRect(ctx, padding, productY, width - padding * 2, productHeight, 12);
      ctx.fillStyle = '#FEF3C7';
      ctx.fill();

      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🔥 爆款产品：${item.hotProduct.name}`, padding + 20, productY + 35);

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.hotProduct.price, width - padding - 20, productY + 35);

      currentY = productY + productHeight + 40;
    }

    // 底部信息
    const footerY = height - 100;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('数据来源：TikTok Creative Center', width / 2, footerY);
    ctx.font = '18px sans-serif';
    ctx.fillText(`生成时间：${new Date().toLocaleString('zh-CN')}`, width / 2, footerY + 30);

    // 底部装饰线
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 60, footerY - 20);
    ctx.lineTo(width / 2 + 60, footerY - 20);
    ctx.stroke();
  },

  // 极简风格（增强版）
  drawMinimalStyle(ctx, item, regionName, width, height) {
    const padding = 70;
    let currentY = padding;

    // 背景 - 纯白
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 大标题
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('热点', width / 2, currentY);
    currentY += 90;

    // 地区
    ctx.fillStyle = '#64748B';
    ctx.font = '26px sans-serif';
    ctx.fillText(regionName, width / 2, currentY);
    currentY += 80;

    // 标题
    ctx.fillStyle = '#020617';
    ctx.font = 'bold 42px sans-serif';
    const titleLines = this.wrapText(ctx, item.title || item.description || '暂无标题', width - padding * 2, 42);
    titleLines.forEach((line) => {
      ctx.fillText(line, width / 2, currentY);
      currentY += 55;
    });
    currentY += 60;

    // 核心数据 - 超大展示
    const mainValue = this.formatNumber(item.stats?.views || 0);
    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(mainValue, width / 2, currentY + 60);
    currentY += 160;

    ctx.fillStyle = '#94A3B8';
    ctx.font = '28px sans-serif';
    ctx.fillText('播放量', width / 2, currentY);
    currentY += 80;

    // 其他数据
    const secondaryStats = `${this.formatNumber(item.stats?.likes || 0)} 点赞  ·  ${this.formatNumber(item.stats?.comments || 0)} 评论  ·  +${item.stats?.growth || 0}%`;
    ctx.fillStyle = '#64748B';
    ctx.font = '24px sans-serif';
    ctx.fillText(secondaryStats, width / 2, currentY);

    // 简约底部
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TikTok Hot Info', width / 2, height - 60);
  },

  // 渐变潮流风格（增强版）
  drawGradientStyle(ctx, item, regionName, width, height) {
    const padding = 50;
    let currentY = padding;

    // 渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0369A1');
    bgGradient.addColorStop(0.5, '#0C4A6E');
    bgGradient.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 装饰圆圈
    this.drawCircle(ctx, width - 100, 150, 80, 'rgba(255,255,255,0.1)');
    this.drawCircle(ctx, 100, height - 200, 120, 'rgba(255,255,255,0.05)');

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 热门资讯', width / 2, currentY);
    currentY += 80;

    // 地区标签
    const badgeWidth = 180;
    const badgeX = (width - badgeWidth) / 2;
    this.drawRoundedRect(ctx, badgeX, currentY - 30, badgeWidth, 56, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '26px sans-serif';
    ctx.fillText(regionName, width / 2, currentY + 8);
    currentY += 100;

    // 封面图（如果有）
    if (this.coverImage) {
      const imgWidth = width - padding * 2;
      const imgHeight = 340;
      this.drawRoundedRect(ctx, padding, currentY, imgWidth, imgHeight, 16);
      ctx.save();
      ctx.clip();
      ctx.drawImage(this.coverImage, padding, currentY, imgWidth, imgHeight);
      ctx.restore();
      currentY += imgHeight + 40;
    }

    // 标题卡片
    const cardHeight = 150;
    this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, cardHeight, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    const titleLines = this.wrapText(ctx, item.title || item.description || '', width - padding * 3, 36);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, padding + 24, currentY + 50 + index * 40);
    });

    // 数据行
    ctx.font = '26px sans-serif';
    ctx.fillText(`${this.formatNumber(item.stats?.views || 0)} 播放  ·  ${this.formatNumber(item.stats?.likes || 0)} 点赞`, padding + 24, currentY + cardHeight - 30);

    currentY += cardHeight + 50;

    // 增长率大展示
    const growthY = currentY;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 100px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${item.stats?.growth || 0}%`, width / 2, growthY + 70);

    ctx.font = '28px sans-serif';
    ctx.fillText('增长率', width / 2, growthY + 120);

    // 底部
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`TikTok Hot Info · ${regionName} · ${this.formatDate()}`, width / 2, height - 60);
  },

  // 工厂推荐风格（新增）
  drawFactoryStyle(ctx, item, regionName, width, height) {
    const padding = 50;
    let currentY = padding;

    // 背景 - 浅蓝色
    ctx.fillStyle = '#F0F9FF';
    ctx.fillRect(0, 0, width, height);

    // 顶部深蓝区域
    ctx.fillStyle = '#0369A1';
    ctx.fillRect(0, 0, width, 180);

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏭 工厂推荐', width / 2, currentY + 20);
    currentY += 60;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '24px sans-serif';
    ctx.fillText(`${regionName} · ${this.formatDate()}`, width / 2, currentY + 20);
    currentY = 220;

    // 工厂卡片
    const cardHeight = 320;
    this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, cardHeight, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 工厂名称
    if (item.factory?.name) {
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.factory.name, width / 2, currentY + 40);

      ctx.fillStyle = '#64748B';
      ctx.font = '24px sans-serif';
      ctx.fillText(`规模：${item.factory.scale || '未知'}`, width / 2, currentY + 80);
    }

    // 数据展示
    const factoryData = [
      { label: '订单量', value: item.factory.orderCount || '---' },
      { label: '响应时间', value: item.factory.responseTime || '---' },
      { label: '认证', value: item.factory.certifications?.length || 0 }
    ];

    const dataY = currentY + 120;
    const colWidth = (width - padding * 2) / 3;
    factoryData.forEach((data, index) => {
      const x = padding + index * colWidth;
      ctx.fillStyle = '#0369A1';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(data.value), x + colWidth / 2, dataY + 30);

      ctx.fillStyle = '#64748B';
      ctx.font = '22px sans-serif';
      ctx.fillText(data.label, x + colWidth / 2, dataY + 60);
    });

    currentY += cardHeight + 40;

    // 爆款产品卡片
    if (item.hotProduct) {
      const productHeight = 140;
      this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, productHeight, 12);
      ctx.fillStyle = '#FEF3C7';
      ctx.fill();

      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🔥 爆款：${item.hotProduct.name}`, padding + 20, currentY + 40);

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.hotProduct.price, width - padding - 20, currentY + 40);

      ctx.fillStyle = '#92400E';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`店铺：${item.hotProduct.shop || '未知'}`, padding + 20, currentY + 90);

      currentY += productHeight + 40;
    }

    // 视频数据
    const videoHeight = 140;
    this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, videoHeight, 12);
    ctx.fillStyle = '#F0FDF4';
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📹 视频数据', padding + 20, currentY + 35);

    const videoStats = `${this.formatNumber(item.stats?.views || 0)} 播放  ·  ${this.formatNumber(item.stats?.likes || 0)} 点赞  ·  +${item.stats?.growth || 0}%`;
    ctx.fillStyle = '#065F46';
    ctx.font = '22px sans-serif';
    ctx.fillText(videoStats, padding + 20, currentY + 90);

    // 底部
    ctx.fillStyle = '#64748B';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TikTok B2B · 工厂出口信息平台', width / 2, height - 60);
  },

  // 产品展示风格（新增）
  drawProductStyle(ctx, item, regionName, width, height) {
    const padding = 50;
    let currentY = padding;

    // 渐变背景 - 橙色调
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#FB923C');
    bgGradient.addColorStop(1, '#EA580C');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 顶部
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📦 爆款产品', width / 2, currentY);
    currentY += 70;

    const badgeWidth = 200;
    const badgeX = (width - badgeWidth) / 2;
    this.drawRoundedRect(ctx, badgeX, currentY - 25, badgeWidth, 50, 25);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px sans-serif';
    ctx.fillText(regionName, width / 2, currentY + 8);
    currentY += 80;

    // 产品卡片
    if (item.hotProduct || item.title) {
      const productHeight = 380;
      this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, productHeight, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      const productName = item.hotProduct?.name || item.title || '未知产品';
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      const productLines = this.wrapText(ctx, productName, width - padding * 3, 42);
      productLines.forEach((line, index) => {
        ctx.fillText(line, width / 2, currentY + 50 + index * 50);
      });

      // 价格
      if (item.hotProduct?.price) {
        ctx.fillStyle = '#EA580C';
        ctx.font = 'bold 72px sans-serif';
        ctx.fillText(item.hotProduct.price, width / 2, currentY + 200);
      }

      // 店铺
      if (item.hotProduct?.shop || item.factory?.name) {
        ctx.fillStyle = '#64748B';
        ctx.font = '26px sans-serif';
        ctx.fillText(`🏪 ${item.hotProduct.shop || item.factory.name}`, width / 2, currentY + 260);
      }

      // 数据
      if (item.stats) {
        ctx.fillStyle = '#0369A1';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(`${this.formatNumber(item.stats.views)} 播放`, width / 2, currentY + 320);
      }

      currentY += productHeight + 40;
    }

    // 工厂信息
    if (item.factory) {
      const factoryHeight = 120;
      this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, factoryHeight, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🏭 工厂：${item.factory.name}`, padding + 20, currentY + 40);

      ctx.fillStyle = '#64748B';
      ctx.font = '24px sans-serif';
      ctx.fillText(`规模：${item.factory.scale || '未知'}  |  认证：${item.factory.certifications?.length || 0} 项`, padding + 20, currentY + 85);

      currentY += factoryHeight + 40;
    }

    // 数据统计
    const statsHeight = 140;
    this.drawRoundedRect(ctx, padding, currentY, width - padding * 2, statsHeight, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    const stats = [
      { label: '播放', value: this.formatNumber(item.stats?.views || 0) },
      { label: '点赞', value: this.formatNumber(item.stats?.likes || 0) },
      { label: '增长', value: `+${item.stats?.growth || 0}%` }
    ];

    const statWidth = (width - padding * 2) / 3;
    stats.forEach((stat, index) => {
      const x = padding + index * statWidth;
      ctx.fillStyle = '#EA580C';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, x + statWidth / 2, currentY + 50);

      ctx.fillStyle = '#64748B';
      ctx.font = '22px sans-serif';
      ctx.fillText(stat.label, x + statWidth / 2, currentY + 90);
    });

    // 底部
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TikTok Hot Info · ' + this.formatDate(), width / 2, height - 60);
  },

  // 辅助函数：绘制圆角矩形
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  // 辅助函数：绘制圆
  drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  },

  // 辅助函数：文字换行
  wrapText(ctx, text, maxWidth, fontSize) {
    ctx.font = `${fontSize}px sans-serif`;
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // 最多3行
    if (lines.length > 3) {
      const lastLine = lines[2].substring(0, lines[2].length - 1) + '...';
      lines[2] = lastLine;
      return lines.slice(0, 3);
    }

    return lines;
  },

  // 辅助函数：文字多行绘制
  drawText(ctx, text, x, y) {
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * 50);
    });
  },

  // 格式化日期
  formatDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化数字
  formatNumber(num) {
    if (!num) return '0';
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '亿';
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // 选择模板
  selectTemplate(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentTemplate: id, loading: true });

    // 重新绘制
    setTimeout(() => {
      this.drawPoster();
      this.setData({ loading: false });
    }, 100);
  },

  // 重新生成
  regenerate() {
    this.setData({ loading: true });
    wx.vibrateShort();
    setTimeout(() => {
      this.drawPoster();
      this.setData({ loading: false });
    }, 500);
  },

  // 保存到相册
  async saveToAlbum() {
    if (!this.posterPath) {
      wx.showToast({ title: '海报未生成', icon: 'none' });
      return;
    }

    wx.vibrateShort();

    try {
      // 请求保存到相册权限
      const authResult = await wx.getSetting();
      if (!authResult.authSetting['scope.writePhotosAlbum']) {
        try {
          await wx.authorize({
            scope: 'scope.writePhotosAlbum'
          });
        } catch (err) {
          wx.showModal({
            title: '需要授权',
            content: '保存海报到相册需要您的授权',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
      }

      // 保存图片到相册
      await wx.saveImageToPhotosAlbum({
        filePath: this.posterPath
      });

      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 分享海报
  sharePoster() {
    if (!this.posterPath) {
      wx.showToast({ title: '海报未生成', icon: 'none' });
      return;
    }

    wx.showShareImageMenu({
      path: this.posterPath,
      success: () => {
        console.log('分享成功');
      },
      fail: (err) => {
        console.error('分享失败:', err);
      }
    });
  },

  // 封装请求
  request(url, options = {}) {
    return app.request(url, options);
  }
});
