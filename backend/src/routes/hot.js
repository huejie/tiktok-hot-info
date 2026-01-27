// B2B工厂信息 API 路由
const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

/**
 * GET /api/hot/search
 * 按行业搜索工厂信息
 * Query: industry, region, limit
 */
router.get('/search', async (req, res) => {
  try {
    const { industry, region, limit = 20 } = req.query;

    if (!industry) {
      return res.status(400).json({
        success: false,
        message: '请提供行业参数'
      });
    }

    const items = await dataService.searchFactories(industry, region, parseInt(limit));

    res.json({
      success: true,
      data: items,
      total: items.length
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

module.exports = router;
