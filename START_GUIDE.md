# TikTok B2B 平台 - 快速启动指南

## 🚀 一键启动

### Windows 用户

你有 **3 种启动方式**可选：

#### 方式 1：批处理脚本（推荐）

**双击运行 `start.bat`**

这是最简单的方式，会自动：
- ✅ 检查 Node.js 和 Python 环境
- ✅ 自动关闭占用端口的进程
- ✅ 启动后端服务（端口 3000）
- ✅ 启动前端服务（端口 8080）
- ✅ 自动打开浏览器

#### 方式 2：PowerShell 脚本

**右键点击 `start.ps1` → 使用 PowerShell 运行**

提供更现代的界面和更好的错误处理：
- 🎨 彩色输出
- 📊 进度显示
- 🔍 详细的环境检查
- 💾 自动保存进程 ID

**注意**：如果遇到执行策略限制，先运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 方式 3：手动启动

```bash
# 终端 1 - 启动后端
cd backend
npm run dev

# 终端 2 - 启动前端
cd web
python -m http.server 8080 --bind 127.0.0.1

# 然后在浏览器打开
# http://127.0.0.1:8080/index-vue.html
```

---

## 🛑 停止服务

### 方式 1：使用停止脚本（推荐）

**双击运行 `stop.bat`**

会自动：
- ✅ 停止后端服务（端口 3000）
- ✅ 停止前端服务（端口 8080）
- ✅ 清理所有相关进程

### 方式 2：手动停止

在每个服务的命令行窗口按 `Ctrl + C`

---

## 📋 环境要求

### 必需软件

1. **Node.js** (v16 或更高)
   - 下载地址：https://nodejs.org/
   - 检查安装：`node --version`

2. **Python** (v3.7 或更高)
   - 下载地址：https://www.python.org/
   - 检查安装：`python --version`
   - ⚠️ 安装时勾选 "Add Python to PATH"

### 自动安装

启动脚本会自动：
- 检测环境是否安装
- 提供下载链接
- 自动安装后端依赖（`npm install`）

---

## 🌐 访问地址

服务启动后，可以通过以下地址访问：

### 前端页面

| 版本 | 地址 | 说明 |
|------|------|------|
| **Vue 版本** | http://127.0.0.1:8080/index-vue.html | ⭐ 推荐，功能完整 |
| HTML 版本 | http://127.0.0.1:8080/index.html | 静态版本 |

### 后端 API

- **API 基础地址**: http://localhost:3000/api
- **健康检查**: http://localhost:3000/api/health

---

## 🎯 主要功能

### 1. 行业热点浏览
- 8 个行业分类
- 4 个地区覆盖
- 实时数据更新

### 2. 工厂推荐
- 工厂详情展示
- 出口潜力评分
- 视频数据统计

### 3. 海报生成
- **工厂海报**：5 种模板
  - 💼 商务专业
  - ✨ 极简风格
  - 🔥 渐变潮流
  - 🏭 工厂推荐
  - 📦 产品展示

- **每周报告海报**：5 种模板
  - 📊 商务报告
  - 📋 简洁报告
  - 🌈 渐变报告
  - 🎴 卡片报告
  - ✨ 现代报告

### 4. 市场报告
- 每周市场亮点
- 数据趋势分析
- 一键生成海报

---

## 🔧 常见问题

### Q1: 端口被占用怎么办？

**A**: 启动脚本会自动处理。如果仍然失败：

```bash
# 手动查找并关闭占用端口的进程
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# 关闭进程（替换 PID）
taskkill /F /PID <进程ID>
```

### Q2: 浏览器无法打开？

**A**: 手动在浏览器地址栏输入：
```
http://127.0.0.1:8080/index-vue.html
```

### Q3: 数据不显示？

**A**: 检查后端服务是否正常运行：

1. 查看后端命令行窗口是否有错误
2. 访问 http://localhost:3000/api/health
3. 确认后端显示 "Server is running"

### Q4: Python 找不到？

**A**: 重新安装 Python 并确保：
- ✅ 勾选 "Add Python to PATH"
- ✅ 选择 "Install for all users"
- ✅ 重启命令行窗口

### Q5: npm install 失败？

**A**: 尝试以下方法：

```bash
# 清理缓存
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force

# 重新安装
npm install
```

或使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### Q6: PowerShell 脚本无法运行？

**A**: 修改执行策略：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

或右键点击 → 属性 → 解锁

---

## 📂 项目结构

```
tiktok-hot-info/
├── start.bat          # ⭐ 批处理启动脚本
├── start.ps1          # PowerShell 启动脚本
├── stop.bat           # 停止服务脚本
├── backend/           # 后端服务
│   ├── src/          # 源代码
│   ├── routes/       # API 路由
│   └── services/     # 业务逻辑
├── web/              # 前端页面
│   ├── index-vue.html   # Vue 版本（推荐）
│   ├── index.html       # HTML 版本
│   └── tiktok-trends.html
└── miniprogram/       # 微信小程序
    └── pages/        # 小程序页面
```

---

## 🎨 使用建议

### 首次使用

1. 双击 `start.bat` 启动服务
2. 浏览器自动打开 Vue 版本
3. 选择一个行业（如"纺织"）
4. 查看工厂列表和详情
5. 尝试生成海报功能

### 海报生成

1. 在工厂卡片点击"生成海报"
2. 选择不同模板预览效果
3. 点击"下载海报"保存图片
4. 同样可生成"每周报告海报"

### 数据刷新

- 前端页面会自动从后端获取最新数据
- 修改行业会重新加载数据
- 海报预览支持实时切换模板

---

## 📞 技术支持

如遇到问题：

1. 查看 `START_GUIDE.md` 常见问题部分
2. 检查命令行窗口的错误信息
3. 确认所有环境依赖已正确安装
4. 尝试停止服务后重新启动

---

## 📊 系统要求

- **操作系统**: Windows 10/11
- **内存**: 至少 4GB RAM
- **磁盘**: 至少 500MB 可用空间
- **网络**: 需要访问本地 localhost

---

## 🎉 开始使用

**只需 3 步：**

1. 双击 `start.bat`
2. 等待服务启动（约 10 秒）
3. 开始使用！

**享受 TikTok B2B 平台带来的便利！** 🚀
