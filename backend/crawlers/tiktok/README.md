# TikTok Crawler 部署指南

## 概述

此目录包含 Douyin_TikTok_Download_API 的部署配置，用于获取真实的 TikTok Creative Center 数据。

## 快速开始

### 1. 获取 TikTok Cookie

**必需步骤** - API 需要有效的 TikTok Cookie 才能访问 Creative Center 数据。

1. 打开浏览器，访问 https://www.tiktok.com 并登录
2. 按 `F12` 打开开发者工具
3. 切换到 `Application` / `应用程序` 标签页
4. 左侧找到 `Cookies` -> `https://www.tiktok.com`
5. 复制所有 Cookie，格式如：`name1=value1; name2=value2; name3=value3`
6. 将 Cookie 粘贴到 `.env` 文件的 `TIKTOK_COOKIE` 变量中

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填写 TikTok Cookie
nano .env
```

### 3. 启动服务

```bash
# 使用 Docker Compose 启动
docker-compose up -d

# 查看日志
docker-compose logs -f tiktok-api

# 检查服务状态
docker-compose ps
```

### 4. 验证服务

```bash
# 健康检查
curl http://localhost:8000/api/health

# 测试获取热门标签
curl "http://localhost:8000/api/creative-center/hashtags?region=us&period=7"
```

## 目录结构

```
tiktok-crawler/
├── docker-compose.yml      # Docker Compose 配置
├── config.yaml            # API 配置文件
├── .env.example           # 环境变量示例
├── .env                   # 环境变量 (需要创建)
├── logs/                  # 日志目录
└── README.md             # 本文档
```

## 支持的地区代码

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

## API 端点

### Creative Center

- `GET /api/creative-center/hashtags` - 获取热门标签
- `GET /api/creative-center/songs` - 获取热门音乐
- `GET /api/creative-center/videos` - 获取热门视频

### 搜索

- `GET /api/search` - 搜索内容

### 用户

- `GET /api/user/detail` - 获取用户详情
- `GET /api/user/videos` - 获取用户视频

## 故障排除

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs tiktok-api

# 检查端口是否被占用
netstat -ano | findstr :8000
```

### Cookie 无效

如果出现 "Cookie 无效" 或 "403 Forbidden" 错误：

1. 重新从浏览器获取最新的 Cookie
2. 确保已登录 TikTok 账号
3. 尝试使用不同的浏览器获取 Cookie

### API 返回空数据

1. 检查 Cookie 是否有效
2. 尝试更换 `region` 参数
3. 检查网络连接和代理设置

### 需要代理

如果需要使用代理访问 TikTok：

```bash
# 编辑 .env 文件
HTTP_PROXY=http://proxy-server:port
HTTPS_PROXY=http://proxy-server:port

# 或使用 SOCKS5
SOCKS_PROXY=socks5://proxy-server:port
```

## 更新服务

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d
```

## 停止服务

```bash
# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

## 参考链接

- [GitHub Repository](https://github.com/Evil0ctal/Douyin_TikTok_Download_API)
- [API Documentation](https://github.com/Evil0ctal/Douyin_TikTok_Download_API/wiki)
