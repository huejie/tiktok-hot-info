// TikTok API 路由 - 使用 Douyin_TikTok_Download_API
const express = require('express');
const router = express.Router();
const tiktokDataService = require('../services/tiktokDataService');
const tiktokCrawler = require('../services/crawler/tikTokCrawler');

/**
 * GET /api/tiktok/health
 * 健康检查 - 检查 TikTok API 服务是否可用
 */
router.get('/health', async (req, res) => {
  try {
    const health = await tiktokDataService.healthCheck();
    res.json({
      success: health.status === 'ok',
      message: health.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/tiktok/hashtags
 * 获取热门标签
 * Query: { region, limit }
 */
router.get('/hashtags', async (req, res) => {
  try {
    const { region = 'north-america', limit = 20 } = req.query;

    console.log(`\n📡 收到热门标签请求，地区: ${region}, 数量: ${limit}`);

    const hashtags = await tiktokDataService.getTrendingHashtags(region, parseInt(limit));

    res.json({
      success: true,
      data: hashtags,
      total: hashtags.length,
      source: 'tiktok_creative_center'
    });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      total: 0
    });
  }
});

/**
 * GET /api/tiktok/songs
 * 获取热门歌曲
 * Query: { region, limit }
 */
router.get('/songs', async (req, res) => {
  try {
    const { region = 'north-america', limit = 20 } = req.query;

    console.log(`\n📡 收到热门歌曲请求，地区: ${region}, 数量: ${limit}`);

    const items = await tiktokCrawler.getTrendingSongs({
      region: tiktokDataService.getRegionCode(region),
      period: 7
    });

    const songs = items.slice(0, parseInt(limit)).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.coverImage,
      stats: item.stats,
      audioUrl: item.audioUrl,
      region: item.region
    }));

    res.json({
      success: true,
      data: songs,
      total: songs.length,
      source: 'tiktok_creative_center'
    });
  } catch (error) {
    console.error('获取热门歌曲失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      total: 0
    });
  }
});

/**
 * GET /api/tiktok/videos
 * 获取热门视频
 * Query: { region, limit }
 */
router.get('/videos', async (req, res) => {
  try {
    const { region = 'north-america', limit = 20 } = req.query;

    console.log(`\n📡 收到热门视频请求，地区: ${region}, 数量: ${limit}`);

    const videos = await tiktokDataService.getTrendingVideos(region, parseInt(limit));

    res.json({
      success: true,
      data: videos,
      total: videos.length,
      source: 'tiktok_creative_center'
    });
  } catch (error) {
    console.error('获取热门视频失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      total: 0
    });
  }
});

/**
 * GET /api/tiktok/search
 * 搜索 TikTok 内容
 * Query: { keyword, type, region, limit }
 */
router.get('/search', async (req, res) => {
  try {
    const { keyword, type = 'video', region = 'north-america', limit = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }

    console.log(`\n📡 搜索 TikTok 内容，关键词: ${keyword}, 类型: ${type}`);

    const results = await tiktokCrawler.search(keyword, {
      type,
      count: parseInt(limit),
      region: tiktokDataService.getRegionCode(region)
    });

    res.json({
      success: true,
      data: results,
      total: results.length,
      meta: {
        keyword,
        type,
        region
      }
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      total: 0
    });
  }
});

/**
 * GET /api/tiktok/factory/:industry
 * 按行业搜索工厂相关内容
 * Query: { region, limit }
 */
router.get('/factory/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { region = 'north-america', limit = 20 } = req.query;

    console.log(`\n📡 搜索工厂内容，行业: ${industry}, 地区: ${region}`);

    const items = await tiktokDataService.searchByIndustry(industry, region, parseInt(limit));

    res.json({
      success: true,
      data: items,
      total: items.length,
      meta: {
        industry,
        region
      }
    });
  } catch (error) {
    console.error('搜索工厂内容失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/tiktok/status
 * 获取 API 服务状态
 */
router.get('/status', async (req, res) => {
  try {
    const health = await tiktokDataService.healthCheck();

    res.json({
      success: true,
      data: {
        status: health.status,
        message: health.message,
        apiUrl: process.env.TIKTOK_API_URL || 'http://localhost:8000',
        dataSource: process.env.DATA_SOURCE || 'mock',
        version: '2.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/tiktok/regions
 * 获取支持的地区列表
 */
router.get('/regions', (req, res) => {
  const regions = [
    { id: 'north-america', name: '北美', code: 'us', flag: '🇺🇸' },
    { id: 'europe', name: '欧洲', code: 'gb', flag: '🇬🇧' },
    { id: 'southeast-asia', name: '东南亚', code: 'sg', flag: '🇸🇬' },
    { id: 'east-asia', name: '东亚', code: 'jp', flag: '🇯🇵' },
    { id: 'south-asia', name: '南亚', code: 'in', flag: '🇮🇳' },
    { id: 'oceania', name: '大洋洲', code: 'au', flag: '🇦🇺' }
  ];

  res.json({
    success: true,
    data: regions
  });
});

module.exports = router;
