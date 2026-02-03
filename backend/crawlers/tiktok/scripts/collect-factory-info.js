#!/usr/bin/env node

/**
 * TikTok 工厂/产品信息采集脚本
 *
 * 此脚本专门用于采集可能与工厂出口相关的 TikTok 热点内容
 * 包括: #b2b, #wholesale, #factory, #export 等标签
 */

const tiktokCrawler = require('../../src/services/crawler/tikTokCrawler');
const fs = require('fs').promises;
const path = require('path');

// B2B/工厂相关的关键词
const B2B_KEYWORDS = [
  'b2b',
  'wholesale',
  'factory',
  'manufacturer',
  'export',
  'supplier',
  'dropshipping',
  'alibaba',
  'made in china',
  'sourcing',
  'oem',
  'odm'
];

// 商品类别关键词
const PRODUCT_CATEGORIES = [
  'electronics',
  'fashion',
  'home goods',
  'beauty',
  'toys',
  'sports',
  'automotive',
  'phone accessories',
  'kitchen',
  'pet supplies'
];

/**
 * 主函数
 */
async function main() {
  console.log('🏭 TikTok B2B 工厂信息采集脚本');
  console.log('=================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, '../output');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // 检查 API 服务
    console.log('📡 检查 TikTok API 服务...');
    await tiktokCrawler.healthCheck();
    console.log('✅ API 服务正常\n');

    const results = {
      collectedAt: new Date().toISOString(),
      data: []
    };

    // 搜索 B2B 相关内容
    console.log('🔍 搜索 B2B 相关内容...\n');

    for (const keyword of B2B_KEYWORDS.slice(0, 5)) { // 限制搜索前5个关键词
      console.log(`搜索关键词: ${keyword}`);

      try {
        const videos = await tiktokCrawler.search(keyword, {
          type: 'video',
          count: 20,
          region: 'us'
        });

        // 过滤出有产品信息的视频
        const productVideos = videos.filter(v => v.product || v.title).map(v => ({
          ...v,
          keywords: [keyword],
          category: categorizeProduct(v.title + ' ' + (v.description || ''))
        }));

        results.data.push(...productVideos);
        console.log(`✅ 找到 ${productVideos.length} 个相关视频\n`);

        // 延迟避免请求过快
        await delay(1500);
      } catch (error) {
        console.error(`❌ 搜索 "${keyword}" 失败: ${error.message}\n`);
      }
    }

    // 保存结果
    const filename = `tiktok-b2b-factory-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));

    console.log('\n=================================');
    console.log(`💾 数据已保存: ${filepath}`);
    console.log(`📊 总计采集: ${results.data.length} 条`);
    console.log('=================================\n');

    // 统计类别
    const categoryStats = {};
    results.data.forEach(item => {
      const cat = item.category || 'other';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    console.log('📈 类别统计:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });

  } catch (error) {
    console.error('\n❌ 采集失败:', error.message);
    process.exit(1);
  }
}

/**
 * 根据内容判断产品类别
 */
function categorizeProduct(content) {
  const lowerContent = content.toLowerCase();

  for (const category of PRODUCT_CATEGORIES) {
    if (lowerContent.includes(category)) {
      return category;
    }
  }

  return 'other';
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 运行脚本
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
