// 热点信息数据模型
class HotItem {
  constructor(data) {
    this.id = data.id;
    this.region = data.region;           // 地区
    this.category = data.category;       // 分类
    this.title = data.title;             // 标题
    this.description = data.description; // 描述
    this.coverImage = data.coverImage;   // 封面图
    this.videoUrl = data.videoUrl;       // 视频链接
    this.productId = data.productId;     // 商品ID（如果有）

    // 数据指标
    this.stats = {
      views: data.stats?.views || 0,           // 播放量
      likes: data.stats?.likes || 0,           // 点赞数
      comments: data.stats?.comments || 0,      // 评论数
      shares: data.stats?.shares || 0,          // 分享数
      sales: data.stats?.sales || 0,            // 销量（如果有）
      growth: data.stats?.growth || 0           // 增长率
    };

    // 商品信息（如果有）
    this.product = data.product || null;

    // 时间信息
    this.publishedAt = data.publishedAt;
    this.updatedAt = data.updatedAt;
  }
}

// Mock 数据生成器
class MockDataGenerator {
  static generateHotItems(region, limit = 20) {
    const items = [];
    const titles = [
      '这产品太火爆了！一周卖出10万件',
      '美国女生都在用的护肤神器',
      '这个家居用品在TikTok上爆火',
      '东南亚最热销的电子产品',
      '欧洲年轻人都在追的潮流单品',
      '非洲市场的新兴爆款',
      '这个设计太聪明了，解决大问题',
      '价格只要$9.9，销量破纪录'
    ];

    const categories = ['ecommerce', 'beauty', 'home', 'electronics', 'clothing', 'food'];

    for (let i = 0; i < limit; i++) {
      items.push(new HotItem({
        id: `${region}-${Date.now()}-${i}`,
        region,
        category: categories[Math.floor(Math.random() * categories.length)],
        title: titles[Math.floor(Math.random() * titles.length)],
        description: '这是一个在TikTok上爆火的产品，引发了大量用户关注和讨论...',
        coverImage: `https://picsum.photos/400/600?random=${Date.now()}-${i}`,
        videoUrl: `https://www.tiktok.com/@user/video/${Date.now()}-${i}`,
        stats: {
          views: Math.floor(Math.random() * 10000000) + 100000,
          likes: Math.floor(Math.random() * 1000000) + 10000,
          comments: Math.floor(Math.random() * 50000) + 500,
          shares: Math.floor(Math.random() * 100000) + 1000,
          sales: Math.floor(Math.random() * 50000) + 1000,
          growth: (Math.random() * 500 + 50).toFixed(1)
        },
        product: {
          price: (Math.random() * 100 + 5).toFixed(2),
          currency: 'USD',
          url: `https://example.com/product/${i}`,
          shop: 'TikTok Shop'
        },
        publishedAt: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }

    return items;
  }
}

module.exports = { HotItem, MockDataGenerator };
