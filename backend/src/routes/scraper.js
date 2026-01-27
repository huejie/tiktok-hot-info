// 爬虫 API 路由
const express = require('express');
const router = express.Router();
const TikTokScraper = require('../services/scraperService');

const scraper = new TikTokScraper();

/**
 * POST /api/scraper/search
 * 使用爬虫搜索 TikTok 内容
 * Body: { keyword, region }
 */
router.post('/search', async (req, res) => {
  try {
    const { keyword, region = 'en' } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }

    console.log(`\n📡 收到爬虫搜索请求: ${keyword}`);

    const results = await scraper.searchTikTokContent(keyword, region);

    res.json({
      success: true,
      data: results,
      total: results.length,
      source: 'scraper'
    });
  } catch (error) {
    console.error('爬虫搜索失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      total: 0
    });
  }
});

/**
 * POST /api/scraper/industry/:id
 * 按行业爬取数据
 * Body: { limit, region }
 */
router.post('/industry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, region = 'en' } = req.body;

    console.log(`\n📡 收到行业爬取请求: ${id}, 数量: ${limit}`);

    const results = await scraper.searchByIndustry(id, parseInt(limit));

    res.json({
      success: true,
      data: results,
      total: results.length,
      industry: id,
      source: 'scraper'
    });
  } catch (error) {
    console.error('行业爬取失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      total: 0
    });
  }
});

/**
 * GET /api/scraper/trending
 * 获取热门视频（通过爬虫）
 * Query: { region, count }
 */
router.get('/trending', async (req, res) => {
  try {
    const { region = 'US', count = 10 } = req.query;

    console.log(`\n📡 收到热门视频请求: ${region}, 数量: ${count}`);

    const results = await scraper.getTrendingTikVideos(region, parseInt(count));

    res.json({
      success: true,
      data: results,
      total: results.length,
      source: 'scraper'
    });
  } catch (error) {
    console.error('获取热门视频失败:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: []
    });
  }
});

/**
 * POST /api/scraper/test
 * 测试爬虫功能
 */
router.post('/test', async (req, res) => {
  try {
    console.log('\n📡 收到爬虫测试请求');

    // 在后台运行测试
    scraper.test().then(() => {
      console.log('测试完成');
    }).catch(err => {
      console.error('测试失败:', err);
    });

    res.json({
      success: true,
      message: '爬虫测试已启动，请查看服务器控制台输出'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/scraper/status
 * 获取爬虫状态
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ready',
      userAgentPool: scraper.userAgents.length,
      searchKeywords: scraper.searchKeywords.length,
      delayRange: scraper.delayRange,
      warning: '⚠️ 爬虫仅供学习测试，请勿频繁使用'
    }
  });
});

module.exports = router;
