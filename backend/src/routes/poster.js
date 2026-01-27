// 海报生成 API 路由
const express = require('express');
const router = express.Router();

/**
 * POST /api/poster/generate
 * 生成海报数据（小程序端负责渲染）
 */
router.post('/generate', (req, res) => {
  try {
    const { hotItems, region, style = 'default' } = req.body;

    if (!hotItems || !Array.isArray(hotItems) || hotItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要生成海报的热点信息'
      });
    }

    // 生成海报数据模板
    const posterData = {
      style,
      region,
      generatedAt: new Date().toISOString(),
      items: hotItems.map(item => ({
        title: item.title,
        stats: item.stats,
        product: item.product,
        coverImage: item.coverImage
      })),
      template: {
        title: 'TikTok 热点资讯',
        subtitle: `${region} - ${new Date().toLocaleDateString()}`,
        footer: '数据来源：TikTok'
      }
    };

    res.json({
      success: true,
      data: posterData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/poster/templates
 * 获取海报模板列表
 */
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'default',
      name: '默认模板',
      preview: 'https://via.placeholder.com/300x400?text=Default'
    },
    {
      id: 'minimal',
      name: '极简风格',
      preview: 'https://via.placeholder.com/300x400?text=Minimal'
    },
    {
      id: 'business',
      name: '商务风格',
      preview: 'https://via.placeholder.com/300x400?text=Business'
    }
  ];

  res.json({
    success: true,
    data: templates
  });
});

module.exports = router;
