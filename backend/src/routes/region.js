// 地区 API 路由
const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

/**
 * GET /api/region
 * 获取所有地区
 */
router.get('/', (req, res) => {
  try {
    const regions = dataService.getRegions();

    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/region/:id
 * 获取地区详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const regions = dataService.getRegions();
    const region = regions.find(r => r.id === id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: '地区不存在'
      });
    }

    // 获取该地区的热点数据
    const items = await dataService.getHotItems(id, 20);

    res.json({
      success: true,
      data: {
        ...region,
        hotItems: items,
        stats: {
          totalItems: items.length,
          totalViews: items.reduce((sum, item) => sum + item.stats.views, 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
