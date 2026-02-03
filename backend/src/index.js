// TikTok热点信息收集 - 后端服务入口
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 路由引入
const hotRoutes = require('./routes/hot');
const regionRoutes = require('./routes/region');
const posterRoutes = require('./routes/poster');
const scraperRoutes = require('./routes/scraper');
const tiktokRoutes = require('./routes/tiktok');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api/hot', hotRoutes);
app.use('/api/region', regionRoutes);
app.use('/api/poster', posterRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/tiktok', tiktokRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务 - 监听所有网络接口（支持局域网访问）
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务启动成功: http://localhost:${PORT}`);
  console.log(`📊 API 文档: http://localhost:${PORT}/health`);
  console.log(`🌐 局域网访问: http://0.0.0.0:${PORT}`);
});

module.exports = app;
