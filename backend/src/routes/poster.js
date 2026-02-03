// 海报生成 API 路由
const express = require('express');
const router = express.Router();

/**
 * POST /api/poster/generate
 * 生成海报数据（包含完整的热点信息）
 */
router.post('/generate', (req, res) => {
  try {
    const { hotItems, region, style = 'business' } = req.body;

    if (!hotItems || !Array.isArray(hotItems) || hotItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要生成海报的热点信息'
      });
    }

    // 获取第一个热点项目的详细信息
    const item = hotItems[0];

    // 生成海报数据模板
    const posterData = {
      style,
      region,
      generatedAt: new Date().toISOString(),
      item: {
        title: item.title,
        description: item.description,
        coverImage: item.coverImage,
        stats: item.stats || {},
        product: item.product || null,
        video: item.video || {},
        factory: item.factory || {},
        export: item.export || {}
      },
      template: {
        title: 'TikTok 热点资讯',
        subtitle: `${region} · ${formatDate()}`,
        footer: '数据来源：TikTok Creative Center'
      },
      styleConfig: getStyleConfig(style)
    };

    res.json({
      success: true,
      data: posterData
    });
  } catch (error) {
    console.error('海报生成失败:', error);
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
      id: 'business',
      name: '商务专业',
      description: '适合商务场景，专业大气',
      preview: '/templates/business-preview.png',
      config: {
        background: '#FFFFFF',
        primaryColor: '#0F172A',
        secondaryColor: '#0369A1'
      }
    },
    {
      id: 'minimal',
      name: '极简风格',
      description: '简约设计，突出重点',
      preview: '/templates/minimal-preview.png',
      config: {
        background: '#F8FAFC',
        primaryColor: '#0F172A',
        secondaryColor: '#64748B'
      }
    },
    {
      id: 'gradient',
      name: '渐变潮流',
      description: '时尚渐变，吸引眼球',
      preview: '/templates/gradient-preview.png',
      config: {
        background: 'linear-gradient(135deg, #0369A1, #0F172A)',
        primaryColor: '#FFFFFF',
        secondaryColor: 'rgba(255,255,255,0.8)'
      }
    }
  ];

  res.json({
    success: true,
    data: templates
  });
});

/**
 * GET /api/poster/item/:id
 * 获取单个热点信息用于海报生成
 */
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 这里应该从数据库获取热点信息
    // 暂时返回模拟数据
    const item = {
      id,
      title: '示例爆款产品标题',
      description: '这是一个示例描述',
      coverImage: 'https://via.placeholder.com/750x600',
      stats: {
        views: 125000,
        likes: 8500,
        comments: 1200,
        growth: 23
      },
      product: {
        name: '示例产品',
        price: '$12.99',
        shop: '示例店铺'
      }
    };

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('获取热点信息失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 辅助函数：获取样式配置
function getStyleConfig(style) {
  const configs = {
    business: {
      background: '#FFFFFF',
      primaryColor: '#0F172A',
      accentColor: '#0369A1',
      secondaryColor: '#475569',
      borderColor: '#E2E8F0',
      cardBackground: '#F8FAFC'
    },
    minimal: {
      background: '#F8FAFC',
      primaryColor: '#0F172A',
      accentColor: '#0369A1',
      secondaryColor: '#64748B',
      borderColor: '#CBD5E1',
      cardBackground: '#FFFFFF'
    },
    gradient: {
      background: 'linear-gradient(135deg, #0369A1, #0F172A)',
      primaryColor: '#FFFFFF',
      accentColor: 'rgba(255,255,255,0.2)',
      secondaryColor: 'rgba(255,255,255,0.6)',
      borderColor: 'rgba(255,255,255,0.2)',
      cardBackground: 'rgba(255,255,255,0.15)'
    }
  };

  return configs[style] || configs.business;
}

// 辅助函数：格式化日期
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
}

module.exports = router;
