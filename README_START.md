# Quick Start Guide

## 🚀 One-Click Launch (Fixed - No Encoding Issues)

All batch files have been updated to **English only** to avoid encoding problems.

### How to Start

1. **Double-click `start.bat`**

   This will automatically:
   - ✅ Check Node.js environment
   - ✅ Check Python environment
   - ✅ Close processes occupying ports
   - ✅ Install dependencies (if needed)
   - ✅ Start backend service (port 3000)
   - ✅ Start frontend service (port 8080)
   - ✅ Open browser automatically

2. **Wait 10 seconds**

3. **Browser opens automatically**

   Visit: http://127.0.0.1:8080/index-vue.html

---

## 🛑 How to Stop

**Double-click `stop.bat`**

This stops all services running on ports 3000 and 8080.

---

## 🔍 Check Status

**Double-click `status.bat`**

Shows:
- Service running status
- Process IDs
- API connection test
- Interactive menu for quick actions

---

## 📁 Available Scripts

| File | Function | Recommended |
|------|----------|-------------|
| **start.bat** | Start all services | ⭐⭐⭐⭐⭐ |
| **stop.bat** | Stop all services | ⭐⭐⭐⭐⭐ |
| **status.bat** | Check service status | ⭐⭐⭐⭐ |
| **start.ps1** | PowerShell launcher (colorful) | ⭐⭐⭐ |

---

## 🌐 Access URLs

After starting:

| Service | URL |
|---------|-----|
| **Frontend (Vue)** | http://127.0.0.1:8080/index-vue.html |
| **Frontend (HTML)** | http://127.0.0.1:8080/index.html |
| **Backend API** | http://localhost:3000/api |

---

## ⚙️ Requirements

- **Node.js** v16+ - Download from https://nodejs.org/
- **Python** 3.7+ - Download from https://www.python.org/
- ⚠️ **Important**: When installing Python, check "Add Python to PATH"

---

## 🔧 Troubleshooting

### Port Already in Use

**Solution**: The `start.bat` script automatically handles this. If it still fails:

```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /F /PID <process_id>
```

### Scripts Don't Work

**Solution**: Run PowerShell script instead:

1. Right-click `start.ps1`
2. Select "Run with PowerShell"

### Browser Doesn't Open

**Solution**: Manually open browser and visit:
```
http://127.0.0.1:8080/index-vue.html
```

### Dependencies Missing

**Solution**: The script auto-installs them. If it fails:
```bash
cd backend
npm install
```

---

## 📊 What You Can Do

1. **Browse Industries**
   - 8 industry categories
   - 4 regions covered

2. **View Factory Recommendations**
   - Factory details
   - Export potential score
   - Video statistics

3. **Generate Posters**
   - **Factory Posters**: 5 templates
     - 💼 Business
     - ✨ Minimal
     - 🔥 Gradient
     - 🏭 Factory
     - 📦 Product

   - **Weekly Report Posters**: 5 templates
     - 📊 Business Report
     - 📋 Minimal Report
     - 🌈 Gradient Report
     - 🎴 Card Report
     - ✨ Modern Report

4. **Share Reports**
   - Download as PNG
   - Share with team
   - Send to clients

---

## 🎯 Quick Workflow

```
1. Double-click start.bat
   ↓
2. Wait 10 seconds
   ↓
3. Browser opens automatically
   ↓
4. Select an industry
   ↓
5. View factories and generate posters
   ↓
6. Double-click stop.bat when done
```

---

## 📖 Documentation

- `START_GUIDE.md` - Detailed guide (Chinese)
- `SCRIPTS_SUMMARY.md` - Script details (Chinese)
- `POSTER_UI_UX_IMPROVEMENTS.md` - Poster features (Chinese)
- `WEEKLY_REPORT_POSTER.md` - Weekly report poster (Chinese)

---

## ✅ Fixed Issues

**Problem**: Chinese characters showing as gibberish in .bat files

**Solution**: All batch files converted to English-only version

**Before**:
```
'鏈嶅姟' 不是内部或外部命令
```

**After**:
```
[OK] Backend server started
```

---

## 🎉 Enjoy!

Double-click `start.bat` and enjoy the TikTok B2B platform!

**For questions or issues**, check the command line window for error messages.
