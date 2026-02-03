# 手动安装指南 - Windows

## 📋 目录
1. [Node.js 安装](#1-nodejs-安装)
2. [Python 安装](#2-python-安装)
3. [验证安装](#3-验证安装)
4. [启动应用](#4-启动应用)

---

## 1. Node.js 安装

### 步骤 1.1：下载

1. 打开浏览器，访问：**https://nodejs.org/**

2. 点击下载按钮：
   - 选择 **"LTS"** 版本（推荐）
   - 或选择 **"20.11.0 LTS"**
   - 会下载 `.msi` 文件（约 30 MB）

### 步骤 1.2：安装

1. 双击下载的 `.msi` 文件

2. 在安装界面：
   - ✅ **接受许可协议**
   - ✅ **选择安装位置**（默认即可）
   - ✅ **点击 "Next" 继续**
   - ✅ **点击 "Install" 安装**

3. 等待安装完成（约 1-2 分钟）

4. 点击 **"Finish"** 完成

### ⚠️ 重要提示：
- Node.js 会自动添加到系统 PATH
- 安装完成后**不需要重启**
- 可以通过命令行验证

---

## 2. Python 安装

### 步骤 2.1：下载

1. 打开浏览器，访问：**https://www.python.org/downloads/**

2. 点击下载 **"Python 3.12.0"** 或最新版本
   - 选择 **"Windows installer (64-bit)"**
   - 会下载 `.exe` 文件（约 25 MB）

### 步骤 2.2：安装（⚠️ 关键步骤）

1. 双击下载的 `.exe` 文件

2. **⚠️ 非常重要：勾选第一个选项！**

   在安装界面底部：
   ```
   ☑ Add python.exe to PATH
   ```

   **这个选项必须勾选！**

3. 选择 **"Install Now"** 或 **"Customize installation"**

4. 如果选择 "Customize installation"：
   - ✅ 确认 **"Add Python to PATH"** 已勾选
   - ✅ 选择 **"Install for all users"**（推荐）
   - ✅ 点击 **"Install"**

5. 等待安装完成（约 1-2 分钟）

6. 点击 **"Close"** 完成

### ⚠️ 重要提示：
- **必须勾选 "Add Python to PATH"**
- 安装完成后**不需要重启**
- 如果忘记勾选 PATH，需要手动配置或重新安装

---

## 3. 验证安装

### 打开命令提示符（CMD）

**方法 1：**
- 按 `Win + R`
- 输入 `cmd`
- 按 `Enter`

**方法 2：**
- 点击开始菜单
- 搜索 "cmd"
- 打开 "命令提示符"

### 验证 Node.js

在命令行中输入：

```bash
node --version
```

**期望输出：**
```
v20.11.0
```

如果显示版本号，说明 Node.js 安装成功 ✅

### 验证 Python

在命令行中输入：

```bash
python --version
```

**期望输出：**
```
Python 3.12.0
```

如果显示版本号，说明 Python 安装成功 ✅

### ❌ 如果命令未找到：

**Python 常见问题：**
```
'python' 不是内部或外部命令
```

**解决方案 1：重新安装 Python**
- 卸载 Python
- 重新运行安装程序
- **确保勾选 "Add Python to PATH"**

**解决方案 2：手动添加到 PATH**
1. 找到 Python 安装位置（通常在 `C:\Users\你的用户名\AppData\Local\Programs\Python\`）
2. 添加到系统环境变量
3. 重启命令行窗口

---

## 4. 启动应用

### 安装成功后，有两种启动方式：

### 方式 1：快速启动（推荐）

1. 进入项目目录：
   ```bash
   cd D:\my-projects\tiktok-hot-info
   ```

2. 双击 **`start.bat`**

3. 等待 10 秒

4. 浏览器自动打开

### 方式 2：手动启动

**步骤 4.1：启动后端**

1. 打开一个新的命令行窗口

2. 进入后端目录：
   ```bash
   cd D:\my-projects\tiktok-hot-info\backend
   ```

3. 启动后端服务：
   ```bash
   npm run dev
   ```

4. 看到以下输出说明成功：
   ```
   Server is running on port 3000
   ```

**步骤 4.2：启动前端**

1. 打开另一个新的命令行窗口

2. 进入前端目录：
   ```bash
   cd D:\my-projects\tiktok-hot-info\web
   ```

3. 启动前端服务：
   ```bash
   python -m http.server 8080 --bind 127.0.0.1
   ```

4. 看到以下输出说明成功：
   ```
   Serving HTTP on 0.0.0.0 port 8080
   ```

**步骤 4.3：打开浏览器**

在浏览器地址栏输入：
```
http://127.0.0.1:8080/index-vue.html
```

---

## 📊 安装总结

### 必需软件：

| 软件 | 版本 | 大小 | 用途 |
|------|------|------|------|
| **Node.js** | v20.11.0 LTS | ~30 MB | 运行后端服务 |
| **Python** | 3.12.0 | ~25 MB | 运行前端服务器 |

### 安装顺序：
```
1. 安装 Node.js
   ↓
2. 安装 Python（记得勾选 Add to PATH）
   ↓
3. 验证安装（命令行检查版本）
   ↓
4. 运行 start.bat
   ↓
5. 开始使用！
```

---

## 🔧 常见问题

### Q1: 下载速度慢怎么办？

**A:** 使用国内镜像源：

**Node.js:**
```
https://npmmirror.com/mirrors/node/
```

**Python:**
```
https://repo.huaweicloud.com/python/3.12.0/python-3.12.0-amd64.exe
```

### Q2: 安装后命令仍然找不到？

**A:** 尝试以下方法：

1. **重启命令行窗口**
   - 关闭所有 cmd 窗口
   - 重新打开 cmd

2. **重启电脑**（最后手段）

3. **检查环境变量**：
   - 右键 "此电脑" → 属性
   - 高级系统设置 → 环境变量
   - 查看 Path 变量是否包含 Node.js 和 Python

### Q3: Python 安装时没有勾选 PATH？

**A:** 需要重新安装：

1. 控制面板 → 卸载程序
2. 卸载 Python
3. 重新运行安装程序
4. **⚠️ 这次务必勾选 "Add Python to PATH"**

### Q4: Node.js 安装失败？

**A:** 尝试：

1. 以管理员身份运行安装程序
2. 临时关闭杀毒软件
3. 检查磁盘空间（至少 500 MB）

### Q5: 版本不对怎么办？

**A:** 按照推荐版本安装：
- Node.js: v20.11.0 或更高
- Python: 3.12.0 或更高（3.7+ 也可）

---

## ✅ 安装检查清单

安装完成后，请确认：

- [ ] Node.js 已安装
- [ ] `node --version` 显示版本号
- [ ] Python 已安装
- [ ] `python --version` 显示版本号
- [ ] 进入项目目录
- [ ] 运行 `start.bat`
- [ ] 后台打开了两个命令行窗口
- [ ] 浏览器自动打开应用

---

## 🎯 快速命令参考

安装完成后，在项目目录下：

```bash
# 快速启动
start.bat

# 检查状态
status.bat

# 停止服务
stop.bat
```

---

## 📞 需要帮助？

如果遇到问题：

1. 检查本指南的"常见问题"部分
2. 确认版本号是否符合要求
3. 确认 Python 添加到了 PATH
4. 尝试重启电脑后再次运行

---

## 🎉 完成安装后

恭喜！现在你可以：
- ✅ 一键启动应用（双击 start.bat）
- ✅ 生成工厂海报（5 种模板）
- ✅ 生成每周报告海报（5 种模板）
- ✅ 浏览市场热点和工厂推荐

**享受 TikTok B2B 平台！** 🚀
