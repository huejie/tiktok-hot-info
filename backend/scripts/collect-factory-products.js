#!/usr/bin/env node
/**
 * TikTok 爆款工厂产品采集脚本
 *
 * 用途：从热门视频中提取工厂和产品信息
 * 运行：node scripts/collect-factory-products.js
 */

const tikTokCrawler = require('../src/services/crawler/tikTokCrawler');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  // 要采集的地区
  regions: ['us', 'gb', 'ca', 'au'],

  // 采集数量（每个地区）
  videoCount: 50,

  // 关键词搜索
  keywords: [
    'factory', 'manufacturer', 'wholesale', 'supplier',
    'china factory', 'dropshipping', 'product', 'warehouse'
  ],

  // 输出目录
  outputDir: path.join(__dirname, '../data/factory-products'),

  // 最小互动量（过滤低质量内容）
  minViews: 100000,      // 最少 10 万播放
  minLikes: 5000,        // 最少 5000 点赞

  // 延迟设置
  searchDelay: 3000,
  videoDelay: 2000
};

/**
 * 根据关键词搜索视频
 */
async function searchByKeyword(keyword, region) {
  console.log(`\n🔍 搜索关键词: "${keyword}" (${region.toUpperCase()})`);

  try {
    const results = await tikTokCrawler.search(keyword, {
      type: 'video',
      count: CONFIG.videoCount,
      region
    });

    console.log(`  ✓ 找到 ${results.length} 个视频`);

    return results.filter(video => {
      const stats = video.stats || {};
      return stats.views >= CONFIG.minViews &&
             stats.likes >= CONFIG.minLikes;
    });
  } catch (error) {
    console.error(`  ✗ 搜索失败: ${error.message}`);
    return [];
  }
}

/**
 * 分析视频提取工厂/产品信息
 */
function extractFactoryInfo(video) {
  const info = {
    id: video.id,
    title: video.title,
    description: video.description,
    coverImage: video.coverImage,
    stats: video.stats,
    author: video.author,
    url: video.url,
    region: video.region,

    // 提取的产品信息
    product: {
      name: '',
      category: '',
      price: '',
      potential: 'medium',
      indicators: []
    },

    // 工厂信息
    factory: {
      name: '',
      location: '',
      type: '',
      confidence: 0
    },

    // 出口信息
    export: {
      markets: [],
      shipping: '',
      moq: ''
    }
  };

  const desc = (video.description || '').toLowerCase();
  const title = (video.title || '').toLowerCase();

  // 检测工厂相关关键词
  const factoryKeywords = [
    'factory', 'manufacturer', 'manufacturing', 'plant',
    'warehouse', 'production', 'assembly', 'workshop',
    '工厂', '制造', '生产'
  ];

  const factoryMatches = factoryKeywords.filter(kw =>
    desc.includes(kw) || title.includes(kw)
  );

  if (factoryMatches.length > 0) {
    info.factory.type = 'Direct Factory';
    info.factory.confidence = Math.min(0.9, 0.5 + factoryMatches.length * 0.1);
    info.product.indicators.push('factory_content');
  }

  // 检测批发/供应链关键词
  const wholesaleKeywords = [
    'wholesale', 'bulk', 'supplier', 'dropship',
    'b2b', 'export', 'trade', 'distributor',
    '批发', '供应商', '出口'
  ];

  const wholesaleMatches = wholesaleKeywords.filter(kw =>
    desc.includes(kw) || title.includes(kw)
  );

  if (wholesaleMatches.length > 0) {
    info.factory.type = info.factory.type || 'Wholesaler';
    info.factory.confidence = Math.min(0.95, 0.6 + wholesaleMatches.length * 0.1);
    info.product.indicators.push('wholesale_content');
  }

  // 检测产品类型
  const productCategories = {
    'beauty': ['makeup', 'cosmetic', 'skincare', 'beauty', 'lipstick', 'serum'],
    'home': ['kitchen', 'home', 'decor', 'furniture', 'gadget', 'organizer'],
    'electronics': ['phone', 'electronics', 'tech', 'gadget', 'usb', 'charger'],
    'clothing': ['dress', 'shirt', 'fashion', 'wear', 'clothing', 'apparel'],
    'toys': ['toy', 'kids', 'children', 'game', 'play'],
    'fitness': ['fitness', 'exercise', 'gym', 'yoga', 'sport'],
    'kitchen': ['kitchen', 'cooking', 'bakeware', 'utensil']
  };

  for (const [category, keywords] of Object.entries(productCategories)) {
    if (keywords.some(kw => desc.includes(kw) || title.includes(kw))) {
      info.product.category = category;
      break;
    }
  }

  // 评估产品潜力
  if (video.stats) {
    const engagementRate = (video.stats.likes + video.stats.comments + video.stats.shares) /
                           (video.stats.views || 1);

    if (engagementRate > 0.15) {
      info.product.potential = 'high';
      info.product.indicators.push('high_engagement');
    } else if (engagementRate > 0.08) {
      info.product.potential = 'medium';
    } else {
      info.product.potential = 'low';
    }
  }

  // 提取价格信息（正则匹配）
  const pricePattern = /\$[\d,]+(?:\.\d{2})?|USD\s*\d+|price[:\s]*\$?\d+/gi;
  const priceMatch = desc.match(pricePattern);
  if (priceMatch) {
    info.product.price = priceMatch[0];
    info.product.indicators.push('price_mentioned');
  }

  // 提取市场信息
  const markets = ['usa', 'uk', 'eu', 'canada', 'australia', 'worldwide', '全球', '美国'];
  for (const market of markets) {
    if (desc.includes(market)) {
      info.export.markets.push(market);
    }
  }

  // 提取 MOQ (最小起订量)
  const moqPattern = /MOQ[:\s]*(\d+)|minimum order[:\s]*(\d+)/gi;
  const moqMatch = desc.match(moqPattern);
  if (moqMatch) {
    info.export.moq = moqMatch[0];
    info.product.indicators.push('moq_mentioned');
  }

  return info;
}

/**
 * 主函数
 */
async function main() {
  console.log('=================================');
  console.log('TikTok 爆款工厂产品采集');
  console.log('=================================');

  // 检查 API 服务
  console.log('\n🔍 检查 TikTok API 服务...');
  try {
    await tikTokCrawler.healthCheck();
    console.log('✓ API 服务正常');
  } catch (error) {
    console.error('✗ API 服务不可用');
    process.exit(1);
  }

  const results = {
    timestamp: new Date().toISOString(),
    products: [],
    summary: {
      totalVideos: 0,
      highPotential: 0,
      withFactory: 0,
      byCategory: {},
      byRegion: {}
    }
  };

  // 按地区和关键词搜索
  for (const region of CONFIG.regions) {
    console.log(`\n📍 采集地区: ${region.toUpperCase()}`);
    results.summary.byRegion[region] = 0;

    for (const keyword of CONFIG.keywords) {
      const videos = await searchByKeyword(keyword, region);

      for (const video of videos) {
        const productInfo = extractFactoryInfo(video);
        results.products.push(productInfo);
        results.summary.totalVideos++;

        // 统计
        if (productInfo.factory.confidence > 0.7) {
          results.summary.withFactory++;
        }
        if (productInfo.product.potential === 'high') {
          results.summary.highPotential++;
        }
        if (productInfo.product.category) {
          results.summary.byCategory[productInfo.product.category] =
            (results.summary.byCategory[productInfo.product.category] || 0) + 1;
        }
        results.summary.byRegion[region]++;
      }

      await delay(CONFIG.searchDelay);
    }
  }

  // 输出摘要
  console.log('\n=================================');
  console.log('采集完成');
  console.log('=================================');
  console.log(`总视频数: ${results.summary.totalVideos}`);
  console.log(`高潜力产品: ${results.summary.highPotential}`);
  console.log(`工厂/供应商: ${results.summary.withFactory}`);
  console.log('\n按分类:');
  for (const [cat, count] of Object.entries(results.summary.byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }

  // 保存数据
  const date = new Date().toISOString().split('T')[0];
  const filename = `factory-products-${date}.json`;
  const filePath = path.join(CONFIG.outputDir, filename);
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n💾 数据已保存到: ${filePath}`);

  return results;
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行脚本
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✓ 脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { main, extractFactoryInfo };
