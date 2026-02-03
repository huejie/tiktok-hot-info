# TikTok 爬虫集成使用指南

## 概述

已成功集成 Douyin_TikTok_Download_API，现在可以获取真实的 TikTok Creative Center 数据。

## 集成内容

### 1. 创建的文件

```
backend/
├── src/services/crawler/
│   └── tikTokCrawler.js          # TikTok 爬虫服务封装
├── crawlers/tiktok/
│   ├── docker-compose.yml        # Docker Compose 配置
│   ├── config.yaml               # API 配置文件
│   ├── .env.example              # 环境变量示例
│   ├── package.json              # 数据采集脚本配置
│   ├── scripts/
│   │   ├── collect.js            # 通用数据采集脚本
│   │   └── collect-factory-info.js  # B2B 工厂信息采集脚本
│   ├── README.md                 # 部署说明
│   └── SETUP_GUIDE.md            # 本文档
```

### 2. 更新的文件

- `src/services/dataService.js` - 集成 TikTok 数据源
- `src/routes/hot.js` - 添加 TikTok API 路由
- `.env` - 添加 TikTok API 配置

## 快速开始

### 第一步：启动 TikTok API 服务

```bash
# 进入爬虫目录
cd backend/crawlers/tiktok

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，添加 TikTok Cookie
# （获取方式见下文）
nano .env

# 启动服务（需要安装 Docker）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f tiktok-api
```

### 第二步：获取 TikTok Cookie

**必需** - API 需要有效的 Cookie 才能访问 TikTok Creative Center 数据。

1. 打开浏览器访问 https://www.tiktok.com 并登录
2. 按 `F12` 打开开发者工具
3. 切换到 `Application` / `应用程序` 标签
4. 左侧找到 `Cookies` → `https://www.tiktok.com`
5. 复制所有 Cookie 值，格式如：`name1=value1; name2=value2; ...`
6. 将 Cookie 粘贴到 `backend/crawlers/tiktok/.env` 文件的 `TIKTOK_COOKIE` 变量

### 第三步：更新后端配置

编辑 `backend/.env` 文件：

```env
# Douyin_TikTok_Download_API 配置
TIKTOK_API_URL=http://localhost:8000
TIKTOK_COOKIE=<你的 Cookie>
TIKTOK_API_KEY=

# 数据源配置（可选）
DATA_SOURCE=hybrid  # mock | tiktok | hybrid
```

### 第四步：重启后端服务

```bash
cd backend

# 安装依赖（如果还没安装）
npm install

# 启动服务
npm run dev
```

## API 使用

### 新增的 TikTok API 端点

#### 1. 获取热门数据（混合）

```http
GET /api/hot/tiktok/trending?region=us&limit=30&type=all
```

参数：
- `region`: 地区代码 (us, gb, ca, au, de, fr, jp, kr, sg, my, th, vn, ph, id, in, br, mx)
- `limit`: 返回数量
- `type`: 数据类型 (hashtags|videos|songs|all)

#### 2. 搜索 TikTok 内容

```http
GET /api/hot/tiktok/search?keyword=wholesale&type=video&count=20
```

参数：
- `keyword`: 搜索关键词
- `type`: 内容类型 (video|hashtag|sound|user)
- `count`: 返回数量

#### 3. 获取热门标签

```http
GET /api/hot/tiktok/hashtags?region=us&limit=20
```

#### 4. 获取热门视频

```http
GET /api/hot/tiktok/videos?region=us&limit=20
```

#### 5. 获取热门音乐

```http
GET /api/hot/tiktok/songs?region=us&limit=20
```

#### 6. 健康检查

```http
GET /api/hot/tiktok/health
```

### 使用真实数据

现有搜索接口已支持 TikTok 数据：

```http
GET /api/hot/search?industry=textile&region=north-america&limit=20&source=tiktok
```

`source` 参数：
- `mock`: 使用模拟数据（默认）
- `tiktok`: 使用真实 TikTok 数据
- `hybrid`: 优先使用 TikTok 数据，失败时回退到 Mock 数据

## 数据采集脚本

### 手动采集数据

```bash
cd backend/crawlers/tiktok

# 采集单个地区所有数据
npm run collect -- --region=us

# 采集热门标签
npm run collect:hashtags -- --region=us

# 采集热门音乐
npm run collect:songs -- --region=us

# 采集热门视频
npm run collect:videos -- --region=us

# 批量采集多个地区
npm run collect:batch

# 采集所有支持地区
npm run collect:all

# 采集 B2B 工厂相关信息
npm run collect:factory
```

### 定时任务配置

使用 crontab 或 Windows Task Scheduler 设置定时任务：

```bash
# 每天凌晨 2 点采集数据
0 2 * * * cd /path/to/backend/crawlers/tiktok && npm run collect:batch
```

## 支持的地区

| 代码 | 国家/地区 |
|------|----------|
| us   | 美国 |
| gb   | 英国 |
| ca   | 加拿大 |
| au   | 澳大利亚 |
| de   | 德国 |
| fr   | 法国 |
| it   | 意大利 |
| es   | 西班牙 |
| jp   | 日本 |
| kr   | 韩国 |
| sg   | 新加坡 |
| my   | 马来西亚 |
| th   | 泰国 |
| vn   | 越南 |
| ph   | 菲律宾 |
| id   | 印度尼西亚 |
| in   | 印度 |
| br   | 巴西 |
| mx   | 墨西哥 |

## 故障排除

### 1. API 服务无法启动

```bash
# 检查 Docker 是否运行
docker ps

# 检查端口是否被占用
netstat -ano | findstr :8000

# 查看详细日志
docker-compose logs tiktok-api
```

### 2. Cookie 无效

如果出现 "403 Forbidden" 或 "Cookie 无效" 错误：

1. 重新从浏览器获取最新的 Cookie
2. 确保已登录 TikTok 账号
3. 尝试使用不同的浏览器获取 Cookie
4. Cookie 通常需要每天更新一次

### 3. API 返回空数据

1. 检查 Cookie 是否有效
2. 尝试更换 `region` 参数
3. 检查网络连接和代理设置
4. 查看服务日志：`docker-compose logs tiktok-api`

### 4. 需要代理访问 TikTok

如果需要使用代理：

编辑 `backend/crawlers/tiktok/.env`：

```env
HTTP_PROXY=http://proxy-server:port
HTTPS_PROXY=http://proxy-server:port
```

或在 `config.yaml` 中配置：

```yaml
proxy:
  http_proxy: "http://proxy-server:port"
  https_proxy: "http://proxy-server:port"
```

## 测试

### 测试 API 服务

```bash
# 健康检查
curl http://localhost:8000/api/health

# 测试获取热门标签
curl "http://localhost:8000/api/creative-center/hashtags?region=us&period=7"
```

### 测试后端集成

```bash
# 测试健康检查
curl http://localhost:3000/api/hot/tiktok/health

# 测试获取热门数据
curl http://localhost:3000/api/hot/tiktok/trending?region=us&limit=10

# 测试搜索
curl "http://localhost:3000/api/hot/tiktok/search?keyword=wholesale&type=video&count=10"
```

## 注意事项

1. **Cookie 有效性**：TikTok Cookie 会过期，需要定期更新（建议每天更新一次）
2. **请求限制**：不要设置过高的并发数，避免被 TikTok 限制访问
3. **数据延迟**：TikTok Creative Center 数据有一定延迟（通常 1-2 天）
4. **代理使用**：某些地区可能需要使用代理才能访问 TikTok API
5. **合法使用**：仅用于学习和研究目的，遵守 TikTok 服务条款

## 下一步

- [ ] 设置定时任务自动采集数据
- [ ] 配置数据库存储采集的数据
- [ ] 实现数据分析和报告功能
- [ ] 添加错误处理和重试机制
- [ ] 配置监控和告警

## 参考链接

- [Douyin_TikTok_Download_API GitHub](https://github.com/Evil0ctal/Douyin_TikTok_Download_API)
- [TikTok Creative Center](https://ads.tiktok.com/business/creativecenter/inspiration/top-ads/pc/en)
