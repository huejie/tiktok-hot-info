#!/usr/bin/env node
/**
 * TikTok 热点数据采集脚本
 *
 * 用途：批量采集 TikTok Creative Center 的热点数据
 * 运行：node scripts/collect-hot-data.js
 *
 * 环境要求：
 * - TikTok API 服务已启动 (docker-compose up -d)
 * - .env 文件中已配置 TIKTOK_API_URL
 */

const tikTokCrawler = require('../src/services/crawler/tikTokCrawler');
const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  // 要采集的地区
  regions: ['us', 'gb', 'ca', 'au', 'jp', 'kr', 'sg', 'my', 'th', 'vn', 'ph'],

  // 采集周期 (天)
  period: 7,

  // 数据保存目录
  outputDir: path.join(__dirname, '../data/collected'),

  // 是否保存到文件
  saveToFile: true,

  // 采集间隔 (毫秒) - 避免请求过快
  delay: 2000
};

/**
 * 采集单个地区的热点数据
 */
async function collectRegion(region) {
  console.log(`\n📊 开始采集地区: ${region.toUpperCase()}`);

  const regionData = {
    region,
    timestamp: new Date().toISOString(),
    hashtags: [],
    songs: [],
    videos: []
  };

  try {
    // 1. 采集热门标签
    console.log(`  🏷️  采集热门标签...`);
    const hashtags = await tikTokCrawler.getTrendingHashtags({
      region,
      period: CONFIG.period,
      device: 'android'
    });
    regionData.hashtags = hashtags;
    console.log(`     ✓ 获取到 ${hashtags.length} 个热门标签`);

    // 延迟避免请求过快
    await delay(CONFIG.delay);

    // 2. 采集热门音乐
    console.log(`  🎵 采集热门音乐...`);
    const songs = await tikTokCrawler.getTrendingSongs({
      region,
      period: CONFIG.period,
      device: 'android'
    });
    regionData.songs = songs;
    console.log(`     ✓ 获取到 ${songs.length} 首热门音乐`);

    // 延迟避免请求过快
    await delay(CONFIG.delay);

    // 3. 采集热门视频
    console.log(`  🎬 采集热门视频...`);
    const videos = await tikTokCrawler.getTrendingVideos({
      region,
      period: CONFIG.period,
      device: 'android'
    });
    regionData.videos = videos;
    console.log(`     ✓ 获取到 ${videos.length} 个热门视频`);

    regionData.success = true;
    regionData.totalItems = hashtags.length + songs.length + videos.length;

  } catch (error) {
    console.error(`  ✗ 采集失败: ${error.message}`);
    regionData.success = false;
    regionData.error = error.message;
  }

  return regionData;
}

/**
 * 保存数据到文件
 */
async function saveData(data, filename) {
  const filePath = path.join(CONFIG.outputDir, filename);
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 数据已保存到: ${filePath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('=================================');
  console.log('TikTok 热点数据采集工具');
  console.log('=================================');

  // 检查 API 服务
  console.log('\n🔍 检查 TikTok API 服务...');
  try {
    await tikTokCrawler.healthCheck();
    console.log('✓ API 服务正常');
  } catch (error) {
    console.error('✗ API 服务不可用，请先启动服务:');
    console.error('  cd backend/crawlers/tiktok && docker-compose up -d');
    process.exit(1);
  }

  // 开始采集
  console.log(`\n🚀 开始采集 ${CONFIG.regions.length} 个地区的热点数据...`);
  console.log(`   采集周期: ${CONFIG.period} 天`);

  const results = {
    timestamp: new Date().toISOString(),
    period: CONFIG.period,
    regions: [],
    summary: {
      total: 0,
      success: 0,
      failed: 0
    }
  };

  for (const region of CONFIG.regions) {
    const regionData = await collectRegion(region);
    results.regions.push(regionData);

    if (regionData.success) {
      results.summary.success++;
      results.summary.total += regionData.totalItems;
    } else {
      results.summary.failed++;
    }

    // 地区之间的延迟
    if (CONFIG.regions.indexOf(region) < CONFIG.regions.length - 1) {
      await delay(CONFIG.delay);
    }
  }

  // 输出摘要
  console.log('\n=================================');
  console.log('采集完成');
  console.log('=================================');
  console.log(`总计: ${results.summary.total} 条数据`);
  console.log(`成功: ${results.summary.success} 个地区`);
  console.log(`失败: ${results.summary.failed} 个地区`);

  // 保存数据
  if (CONFIG.saveToFile) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `tiktok-hot-data-${date}.json`;
    await saveData(results, filename);
  }

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

module.exports = { main, collectRegion };
