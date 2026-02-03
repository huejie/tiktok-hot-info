#!/usr/bin/env node

/**
 * TikTok 热点数据采集脚本
 *
 * 使用方式:
 * node scripts/collect.js --region=us --type=all --period=7
 *
 * 参数:
 * --region: 地区代码 (默认: us)
 * --type: 数据类型 (hashtags|songs|videos|all, 默认: all)
 * --period: 时间周期 (1|7|30, 默认: 7)
 * --output: 输出文件路径 (默认: ./output)
 * --batch: 批量模式，采集多个地区 (逗号分隔)
 */

const tiktokCrawler = require('../../src/services/crawler/tikTokCrawler');
const fs = require('fs').promises;
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value || true;
  return acc;
}, {});

// 配置
const config = {
  region: args.region || 'us',
  type: args.type || 'all',
  period: parseInt(args.period) || 7,
  output: args.output || path.join(__dirname, '../output'),
  batch: args.batch ? args.batch.split(',') : null
};

// 支持的地区
const SUPPORTED_REGIONS = [
  'us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'es', 'jp', 'kr',
  'sg', 'my', 'th', 'vn', 'ph', 'id', 'in', 'br', 'mx', 'sa'
];

/**
 * 主采集函数
 */
async function main() {
  console.log('🚀 TikTok 热点数据采集脚本');
  console.log('================================');
  console.log(`地区: ${config.region}`);
  console.log(`类型: ${config.type}`);
  console.log(`周期: ${config.period} 天`);
  console.log('================================\n');

  try {
    // 检查 API 服务
    console.log('📡 检查 TikTok API 服务...');
    await tiktokCrawler.healthCheck();
    console.log('✅ API 服务正常\n');

    // 确保输出目录存在
    await fs.mkdir(config.output, { recursive: true });

    // 批量采集模式
    if (config.batch) {
      await batchCollect(config.batch);
    } else {
      // 单地区采集
      await collectRegion(config.region);
    }

    console.log('\n✅ 采集完成！');
  } catch (error) {
    console.error('\n❌ 采集失败:', error.message);
    process.exit(1);
  }
}

/**
 * 单地区采集
 */
async function collectRegion(region) {
  console.log(`📍 采集地区: ${region}\n`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const data = {
    region,
    period: config.period,
    collectedAt: new Date().toISOString(),
    data: {}
  };

  const tasks = [];

  // 根据类型添加采集任务
  if (config.type === 'all' || config.type === 'hashtags') {
    tasks.push(collectHashtags(region, data));
  }
  if (config.type === 'all' || config.type === 'songs') {
    tasks.push(collectSongs(region, data));
  }
  if (config.type === 'all' || config.type === 'videos') {
    tasks.push(collectVideos(region, data));
  }

  // 并发执行采集任务
  await Promise.all(tasks);

  // 保存数据
  const filename = `tiktok-${region}-${timestamp}.json`;
  const filepath = path.join(config.output, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));

  console.log(`\n💾 数据已保存: ${filepath}`);
  console.log(`📊 采集统计:`);
  console.log(`   - 标签: ${data.data.hashtags?.length || 0} 条`);
  console.log(`   - 音乐: ${data.data.songs?.length || 0} 条`);
  console.log(`   - 视频: ${data.data.videos?.length || 0} 条`);
}

/**
 * 批量采集多个地区
 */
async function batchCollect(regions) {
  console.log(`🌍 批量采集模式: ${regions.length} 个地区\n`);

  const results = [];

  for (const region of regions) {
    if (!SUPPORTED_REGIONS.includes(region)) {
      console.warn(`⚠️  跳过不支持的地区: ${region}`);
      continue;
    }

    try {
      console.log(`\n${'='.repeat(50)}`);
      await collectRegion(region);
      console.log(`${'='.repeat(50)}`);

      // 添加延迟避免请求过快
      await delay(2000);
    } catch (error) {
      console.error(`❌ 地区 ${region} 采集失败:`, error.message);
    }
  }

  console.log('\n📋 批量采集完成');
}

/**
 * 采集热门标签
 */
async function collectHashtags(region, data) {
  console.log('🏷️  采集热门标签...');

  try {
    const hashtags = await tiktokCrawler.getTrendingHashtags({
      region,
      period: config.period
    });

    data.data.hashtags = hashtags;
    console.log(`✅ 标签采集完成: ${hashtags.length} 条`);

    return hashtags;
  } catch (error) {
    console.error(`❌ 标签采集失败: ${error.message}`);
    data.data.hashtags = [];
    return [];
  }
}

/**
 * 采集热门音乐
 */
async function collectSongs(region, data) {
  console.log('🎵 采集热门音乐...');

  try {
    const songs = await tiktokCrawler.getTrendingSongs({
      region,
      period: config.period
    });

    data.data.songs = songs;
    console.log(`✅ 音乐采集完成: ${songs.length} 条`);

    return songs;
  } catch (error) {
    console.error(`❌ 音乐采集失败: ${error.message}`);
    data.data.songs = [];
    return [];
  }
}

/**
 * 采集热门视频
 */
async function collectVideos(region, data) {
  console.log('🎬 采集热门视频...');

  try {
    const videos = await tiktokCrawler.getTrendingVideos({
      region,
      period: config.period
    });

    data.data.videos = videos;
    console.log(`✅ 视频采集完成: ${videos.length} 条`);

    return videos;
  } catch (error) {
    console.error(`❌ 视频采集失败: ${error.message}`);
    data.data.videos = [];
    return [];
  }
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 显示帮助信息
if (args.help || args.h) {
  console.log(`
TikTok 热点数据采集脚本

使用方式:
  node scripts/collect.js [选项]

选项:
  --region=<代码>    地区代码 (默认: us)
  --type=<类型>      数据类型 (hashtags|songs|videos|all, 默认: all)
  --period=<天数>    时间周期 (1|7|30, 默认: 7)
  --output=<路径>    输出目录 (默认: ./output)
  --batch=<列表>     批量模式，多个地区用逗号分隔
  --help             显示此帮助信息

示例:
  # 采集美国地区所有数据
  node scripts/collect.js --region=us

  # 采集英国地区标签数据
  node scripts/collect.js --region=gb --type=hashtags

  # 批量采集多个地区
  node scripts/collect.js --batch=us,gb,ca,au

支持的地区:
  ${SUPPORTED_REGIONS.join(', ')}
  `);
  process.exit(0);
}

// 运行脚本
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
