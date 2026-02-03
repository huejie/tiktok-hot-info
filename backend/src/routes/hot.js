// B2B工厂信息 API 路由
const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

/**
 * GET /api/hot/search
 * 按行业搜索工厂信息
 * Query: industry, region, limit, source (mock|tiktok|hybrid)
 */
router.get('/search', async (req, res) => {
  try {
    const { industry, region, limit = 20, source } = req.query;

    if (!industry) {
      return res.status(400).json({
        success: false,
        message: '请提供行业参数'
      });
    }

    const items = await dataService.searchFactories(industry, region, parseInt(limit), source);

    res.json({
      success: true,
      data: items,
      total: items.length,
      source: source || 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/overview
 * 获取地区-行业概览数据
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = await dataService.getRegionIndustryOverview();

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/factory/:id
 * 获取工厂详情
 */
router.get('/factory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const factory = await dataService.getFactoryDetail(id);

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: '工厂信息不存在'
      });
    }

    res.json({
      success: true,
      data: factory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/products
 * 获取爆款产品列表
 * Query: industry, limit
 */
router.get('/products', async (req, res) => {
  try {
    const { industry, limit = 10 } = req.query;
    const products = await dataService.getHotProducts(industry, parseInt(limit));

    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/weekly-report
 * 获取每周报告
 */
router.get('/weekly-report', async (req, res) => {
  try {
    const report = await dataService.generateWeeklyReport();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/industries
 * 获取行业列表
 */
router.get('/industries', async (req, res) => {
  try {
    const industries = await dataService.getIndustryList();

    res.json({
      success: true,
      data: industries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/tiktok/trending
 * 获取 TikTok Creative Center 热门数据
 * Query: region (us, gb, ca, etc.), limit, type (hashtags|videos|songs|all)
 */
router.get('/tiktok/trending', async (req, res) => {
  try {
    const { region = 'us', limit = 30, type = 'all' } = req.query;

    const data = await dataService.getTikTokTrendingData(region, parseInt(limit));

    // 根据类型过滤
    let filteredData = data;
    if (type !== 'all') {
      filteredData = data.filter(item => item.type === type);
    }

    res.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
      region,
      collectedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/tiktok/search
 * 搜索 TikTok 内容
 * Query: keyword, type (video|hashtag|sound|user), count
 */
router.get('/tiktok/search', async (req, res) => {
  try {
    const { keyword, type = 'video', count = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }

    const results = await dataService.searchTikTokContent(keyword, type, parseInt(count));

    res.json({
      success: true,
      data: results,
      total: results.length,
      keyword,
      type
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/tiktok/hashtags
 * 获取热门标签
 * Query: region, limit
 */
router.get('/tiktok/hashtags', async (req, res) => {
  try {
    const { region = 'us', limit = 20 } = req.query;
    const tiktokCrawler = require('../services/crawler/tikTokCrawler');

    await tiktokCrawler.healthCheck();
    const hashtags = await tiktokCrawler.getTrendingHashtags({
      region,
      period: 7
    });

    res.json({
      success: true,
      data: hashtags.slice(0, parseInt(limit)),
      total: hashtags.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/tiktok/videos
 * 获取热门视频
 * Query: region, limit
 */
router.get('/tiktok/videos', async (req, res) => {
  try {
    const { region = 'us', limit = 20 } = req.query;
    const tiktokCrawler = require('../services/crawler/tikTokCrawler');

    await tiktokCrawler.healthCheck();
    const videos = await tiktokCrawler.getTrendingVideos({
      region,
      period: 7
    });

    res.json({
      success: true,
      data: videos.slice(0, parseInt(limit)),
      total: videos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/tiktok/songs
 * 获取热门音乐
 * Query: region, limit
 */
router.get('/tiktok/songs', async (req, res) => {
  try {
    const { region = 'us', limit = 20 } = req.query;
    const tiktokCrawler = require('../services/crawler/trawler/tikTokCrawler');

    await tiktokCrawler.healthCheck();
    const songs = await tiktokCrawler.getTrendingSongs({
      region,
      period: 7
    });

    res.json({
      success: true,
      data: songs.slice(0, parseInt(limit)),
      total: songs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/hot/tiktok/health
 * 检查 TikTok API 服务健康状态
 */
router.get('/tiktok/health', async (req, res) => {
  try {
    const tiktokCrawler = require('../services/crawler/tikTokCrawler');
    const health = await tiktokCrawler.healthCheck();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        api: health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'TikTok API 服务不可用',
      error: error.message
    });
  }
});

module.exports = router;
