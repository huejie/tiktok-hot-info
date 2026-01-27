// TikTok Creative Center API 路由
const express = require('express');
const router = express.Router();
const TikTokCreativeCenterScraper = require('../services/tiktokScraper');

const scraper = new TikTokCreativeCenterScraper();

/**
 * GET /api/tiktok/hashtags
 * 获取热门标签
 * Query: { limit }
 */
router.get('/hashtags', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    console.log(`\n📡 收到热门标签请求，数量: ${limit}`);

    const hashtags = await scraper.scrapePopularHashtags(parseInt(limit));

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
 * Query: { limit }
 */
router.get('/songs', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    console.log(`\n📡 收到热门歌曲请求，数量: ${limit}`);

    const songs = await scraper.scrapePopularSongs(parseInt(limit));

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
 * Query: { limit }
 */
router.get('/videos', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    console.log(`\n📡 收到热门视频请求，数量: ${limit}`);

    const videos = await scraper.scrapePopularVideos(parseInt(limit));

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
 * POST /api/tiktok/test
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
      message: 'TikTok 爬虫测试已启动，请查看服务器控制台输出'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/tiktok/status
 * 获取爬虫状态
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ready',
      proxy: scraper.proxy.server || '未配置',
      urls: Object.keys(scraper.urls),
      warning: '⚠️ 需要系统安装 Chrome 浏览器'
    }
  });
});

module.exports = router;
