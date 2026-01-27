# TikTok B2B出口工厂信息收集项目

> 为工厂、制造商、出口企业提供 TikTok B2B 出口市场分析的小程序

## 项目概述

本项目的目标是帮助中国工厂、制造商、出口企业了解 TikTok 各地区（北美、欧洲、东南亚、非洲）的 B2B 出口现状，包括：
- 各行业工厂在 TikTok 上的表现
- 出口目标国家分析
- 爆款产品推荐
- 便于新客户签单和老客户维护

## 核心功能

### 1. 新客户签单
```
客户询问："我们做纺织的，适合出口到哪里？"
→ 搜索"纺织"行业
→ 查看各地区纺织行业在 TikTok 上的表现
→ 展示数据：北美播放量 X万，欧洲 X万，东南亚 X万...
→ 推荐目标国家，辅助签单
```

### 2. 老客户维护
```
每周一自动生成上周热点报告
→ 包含：行业爆款、新兴工厂、市场趋势
→ 一键分享到客户群
→ 客户看到价值，增强粘性
```

## 功能特性

### 已实现（MVP）
- ✅ 行业搜索（纺织、电子、机械、化工、家居、食品、汽车、建材）
- ✅ 地区筛选（北美、欧洲、东南亚、非洲）
- ✅ 出口概况对比（工厂数、播放量、询盘数）
- ✅ 爆款产品推荐
- ✅ 工厂详情展示（出口潜力评分、认证、联系方式）
- ✅ 每周报告生成

### 后续规划
- ⏳ 真实数据接入（Apify TikTok API）
- ⏳ 历史数据趋势分析
- ⏳ 行业资讯模块
- ⏳ 询盘对接功能

## 项目结构

```
tiktok-hot-info/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑（数据采集）
│   │   ├── models/      # 数据模型（工厂信息）
│   │   ├── config/      # 配置（行业/地区）
│   │   └── index.js     # 入口
│   ├── package.json
│   └── .env             # 环境变量
├── miniprogram/         # 微信小程序
│   ├── pages/           # 页面
│   │   ├── index/       # 行业搜索首页
│   │   ├── region/      # 地区选择页
│   │   └── detail/      # 工厂详情页
│   ├── components/      # 组件
│   ├── utils/           # 工具函数
│   └── app.js
└── docs/                # 文档
```

## 快速开始

### 后端启动

```bash
cd backend
npm install
npm start
```

### 微信小程序

1. 使用微信开发者工具打开 `miniprogram` 目录
2. 配置 AppID
3. 修改 `app.js` 中的 `apiBase`
4. 点击编译运行

## API 文档

### 获取行业列表
```
GET /api/hot/industries
```

### 按行业搜索工厂
```
GET /api/hot/search?industry=textile&region=north-america&limit=20
```

### 获取工厂详情
```
GET /api/hot/factory/:id
```

### 获取出口概况
```
GET /api/hot/overview
```

### 获取爆款产品
```
GET /api/hot/products?industry=textile&limit=10
```

### 获取每周报告
```
GET /api/hot/weekly-report
```

## 行业分类

| ID | 名称 | 关键词 |
|----|------|--------|
| textile | 纺织服装 | textile, garment, fabric, clothing |
| electronics | 电子数码 | electronics, circuit, chip, pcb |
| machinery | 机械制造 | machinery, equipment, manufacturing |
| chemical | 化工材料 | chemical, plastic, rubber, material |
| home | 家居用品 | home, furniture, decor, household |
| food | 食品饮料 | food, beverage, snack, drink |
| auto | 汽车配件 | auto, car, vehicle, parts |
| construction | 建筑材料 | construction, building, material |

## 数据来源

### Demo 阶段（当前）
- 使用 Mock 数据生成
- 模拟工厂信息、出口数据、爆款产品

### 正式运营
- **方案一**: TikTok 搜索 + 爬取
  - 搜索关键词："factory", "manufacturer", "wholesale"
  - 分析视频内容和出口目标

- **方案二**: 付费 API
  - Apify TikTok Scraper: $0.002/请求
  - 按搜索关键词获取数据

- **方案三**: 人工收集 + 数据库
  - 人工筛选优质工厂账号
  - 建立工厂数据库
  - 定期更新数据

## 环境变量

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# API 配置
APIFY_API_TOKEN=
DATA365_API_KEY=

# 数据源配置
DATA_SOURCE=mock  # mock | api
UPDATE_INTERVAL=weekly  # daily | weekly
```

## 技术栈

### 后端
- Node.js + Express
- Axios (HTTP 请求)
- Cheerio (HTML 解析，爬虫用)

### 前端
- 微信小程序原生框架
- WXML + WXSS + JavaScript

## 部署建议

### 服务器
- 推荐香港云服务器（可访问 TikTok）
- 配置：2核4GB，5Mbps带宽

### 域名
- 需备案域名（微信小程序要求）
- 配置 HTTPS 证书

## 开发注意事项

1. **小程序域名配置**
   - 在微信公众平台配置服务器域名白名单
   - 必须使用 HTTPS

2. **数据获取频率**
   - Demo 阶段用 Mock 数据
   - 正式运营注意 API 调用限制

3. **合规性**
   - 爬虫方案违反 TikTok 服务条款
   - 正式运营建议使用付费 API

## License

MIT
