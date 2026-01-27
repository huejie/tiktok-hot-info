// B2B工厂信息数据模型
class FactoryInfo {
  constructor(data) {
    this.id = data.id;
    this.region = data.region;              // 目标地区
    this.industry = data.industry;          // 行业分类

    // 工厂基本信息
    this.factory = {
      name: data.factory?.name || '',           // 工厂名称
      type: data.factory?.type || '',           // 工厂类型
      location: data.factory?.location || '',   // 工厂位置
      established: data.factory?.established || '', // 成立年份
      scale: data.factory?.scale || '',         // 规模（中小型/大型）
      certifications: data.factory?.certifications || [] // 认证（ISO, CE等）
    };

    // 视频内容
    this.video = {
      title: data.video?.title || '',
      description: data.video?.description || '',
      coverImage: data.video?.coverImage || '',
      videoUrl: data.video?.videoUrl || '',
      publishAt: data.video?.publishAt || new Date().toISOString()
    };

    // 出口信息
    this.export = {
      targetCountries: data.export?.targetCountries || [],     // 出口目标国家
      mainMarkets: data.export?.mainMarkets || [],             // 主要市场
      exportVolume: data.export?.exportVolume || 0,            // 出口量
      annualRevenue: data.export?.annualRevenue || 0           // 年营收（万美元）
    };

    // 数据统计
    this.stats = {
      views: data.stats?.views || 0,
      likes: data.stats?.likes || 0,
      comments: data.stats?.comments || 0,
      shares: data.stats?.shares || 0,
      followers: data.stats?.followers || 0,       // 账号粉丝数
      inquiryCount: data.stats?.inquiryCount || 0   // 询盘数
    };

    // 产品信息
    this.products = data.products || [];
    this.hotProduct = data.hotProduct || null;     // 爆款产品

    // 联系方式
    this.contact = {
      whatsapp: data.contact?.whatsapp || '',
      email: data.contact?.email || '',
      website: data.contact?.website || '',
      wechat: data.contact?.wechat || ''
    };

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 是否是爆款（高互动量）
  isHot() {
    return this.stats.views > 100000 || this.stats.likes > 10000;
  }

  // 获取出口潜力评分
  getExportPotential() {
    let score = 0;
    if (this.stats.views > 50000) score += 20;
    if (this.stats.inquiryCount > 100) score += 30;
    if (this.export.targetCountries.length > 3) score += 20;
    if (this.factory.certifications.length > 0) score += 15;
    if (this.hotProduct) score += 15;
    return score;
  }
}

// Mock 数据生成器
class MockDataGenerator {
  // 生成工厂信息
  static generateFactoryInfo(region, industry, limit = 20) {
    const items = [];

    const factoryNames = [
      '鑫源纺织制品厂', '华泰电子科技', '宏图机械制造',
      '亿达化工材料', '锦绣家居用品', '美味食品加工厂',
      '精工汽车配件', '长城建筑材料', '创新科技制造',
      '东方国际贸易', '诚信制造集团', '永盛出口工厂'
    ];

    const videoTitles = [
      '工厂直供，品质保证，支持OEM/ODM定制',
      '{{industry}}工厂实景拍摄，年产{{quantity}}万件',
      '出口{{region}}{{years}}年，品质认证齐全',
      '工厂直销价格，比中间商低30%',
      '通过{{certifications}}认证，可出口{{countries}}',
      '{{industry}}爆款产品，月销{{sales}}件',
      '源头工厂，承接{{industry}}订单，起订量{{moq}}',
      '实地验厂，欢迎{{region}}客户实地考察'
    ];

    const products = [
      { name: '定制T恤', price: '$3.5-5.2', moq: '500件', specs: '纯棉/涤纶' },
      { name: '电路板PCB', price: '$2-15', moq: '100片', specs: 'FR4/铝基板' },
      { name: '数控机床', price: '$5000-15000', moq: '1台', specs: 'CJK6136' },
      { name: '塑料颗粒', price: '$800-1500/吨', moq: '1吨', specs: 'PP/PE/ABS' },
      { name: '家具套装', price: '$50-200/套', moq: '50套', specs: '实木/板材' },
      { name: '零食礼盒', price: '$5-15/盒', moq: '200盒', specs: '定制包装' }
    ];

    const certifications = ['ISO9001', 'CE', 'FCC', 'RoHS', 'SGS', 'BSCI'];
    const countries = ['美国', '加拿大', '英国', '德国', '法国', '日本', '韩国', '澳大利亚'];

    for (let i = 0; i < limit; i++) {
      const certCount = Math.floor(Math.random() * 4) + 1;
      const countryCount = Math.floor(Math.random() * 5) + 2;
      const productCount = Math.floor(Math.random() * 5) + 1;

      items.push(new FactoryInfo({
        id: `${region}-${industry}-${Date.now()}-${i}`,
        region,
        industry,
        factory: {
          name: factoryNames[Math.floor(Math.random() * factoryNames.length)],
          type: industry,
          location: '中国广东省东莞市',
          established: String(2000 + Math.floor(Math.random() * 24)),
          scale: Math.random() > 0.5 ? '大型' : '中型',
          certifications: certifications.slice(0, certCount)
        },
        video: {
          title: this.generateTitle(videoTitles, region, industry),
          description: '专业B2B工厂，承接{{industry}}订单，支持OEM/ODM定制',
          coverImage: `https://picsum.photos/400/300?random=${Date.now()}-${i}`,
          videoUrl: `https://www.tiktok.com/@factory/video/${Date.now()}-${i}`,
          publishAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        export: {
          targetCountries: countries.slice(0, countryCount),
          mainMarkets: countries.slice(0, Math.floor(countryCount / 2) + 1),
          exportVolume: Math.floor(Math.random() * 500 + 50),
          annualRevenue: Math.floor(Math.random() * 5000 + 500)
        },
        stats: {
          views: Math.floor(Math.random() * 500000) + 10000,
          likes: Math.floor(Math.random() * 50000) + 1000,
          comments: Math.floor(Math.random() * 5000) + 100,
          shares: Math.floor(Math.random() * 10000) + 200,
          followers: Math.floor(Math.random() * 100000) + 5000,
          inquiryCount: Math.floor(Math.random() * 500) + 20
        },
        products: products.slice(0, productCount),
        hotProduct: Math.random() > 0.5 ? products[Math.floor(Math.random() * products.length)] : null,
        contact: {
          whatsapp: '+86 138****' + String(Math.floor(Math.random() * 9000) + 1000),
          email: 'sales@factory-example.com',
          website: 'www.factory-example.com',
          wechat: 'factory' + String(Math.floor(Math.random() * 9000) + 1000)
        }
      }));
    }

    return items;
  }

  static generateTitle(titles, region, industry) {
    return titles[Math.floor(Math.random() * titles.length)]
      .replace('{{region}}', region)
      .replace('{{industry}}', industry)
      .replace('{{quantity}}', String(Math.floor(Math.random() * 900 + 100)))
      .replace('{{years}}', String(Math.floor(Math.random() * 10 + 3)))
      .replace('{{certifications}}', 'ISO/CE')
      .replace('{{countries}}', '欧美日韩')
      .replace('{{sales}}', String(Math.floor(Math.random() * 9000 + 1000)))
      .replace('{{moq}}', String(Math.floor(Math.random() * 900 + 100)));
  }
}

module.exports = { FactoryInfo, MockDataGenerator };
