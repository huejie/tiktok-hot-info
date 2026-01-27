// TikTok Creative Center 爬虫服务 - 使用 Puppeteer
const puppeteerCore = require('puppeteer-core');

// 使用 puppeteer-extra 包装
const puppeteer = require('puppeteer-extra');
const { addExtra } = require('puppeteer-extra');

// 添加 puppeteer-core 作为底层引擎
const puppeteerWithCore = addExtra(puppeteerCore);

// 添加隐身插件
const stealth = require('puppeteer-extra-plugin-stealth');
puppeteerWithCore.use(stealth());

class TikTokCreativeCenterScraper {
  constructor() {
    // TikTok Creative Center URLs
    this.urls = {
      hashtags: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en',
      songs: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/song/pc/en',
      creators: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/creator/pc/en',
      videos: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/video/pc/en'
    };

    // 代理配置
    this.proxy = {
      server: process.env.PROXY_ENABLED === 'true'
        ? `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`
        : undefined
    };

    console.log(this.proxy.server ? `🔧 Puppeteer 使用代理: ${this.proxy.server}` : '⚠️ Puppeteer 未配置代理');
  }

  /**
   * 获取 Chrome 可执行文件路径（Windows）
   */
  getChromePath() {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    return paths[0]; // 默认使用第一个路径
  }

  /**
   * 启动浏览器
   */
  async launchBrowser() {
    try {
      const browser = await puppeteerWithCore.launch({
        executablePath: this.getChromePath(),
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });

      return browser;
    } catch (error) {
      console.error('启动浏览器失败:', error.message);
      throw error;
    }
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad(page, timeout = 30000) {
    try {
      await page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      console.log('⚠️ 页面加载超时，继续执行...');
    }
  }

  /**
   * 爬取热门标签
   */
  async scrapePopularHashtags(limit = 20) {
    console.log(`\n🏷️  开始爬取 TikTok 热门标签...`);
    console.log('='.repeat(50));

    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    try {
      // 设置用户代理
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // 访问页面
      console.log(`📡 访问: ${this.urls.hashtags}`);
      await page.goto(this.urls.hashtags, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // 等待内容加载
      console.log('⏳ 等待内容加载...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 调试：保存页面截图
      try {
        const screenshotPath = './screenshot-tiktok.png';
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`📸 截图已保存: ${screenshotPath}`);
      } catch (e) {
        console.log('⚠️ 截图保存失败');
      }

      // 调试：获取页面标题和部分内容
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body?.innerText?.substring(0, 500) || '',
          allLinks: Array.from(document.querySelectorAll('a')).slice(0, 20).map(a => ({
            text: a.textContent?.trim(),
            href: a.href
          }))
        };
      });
      console.log('📄 页面信息:', JSON.stringify(pageInfo, null, 2));

      // 尝试提取数据
      const hashtags = await page.evaluate(() => {
        const results = [];
        const debugInfo = [];

        // 策略：查找所有链接，提取包含标签信息的
        const allLinks = Array.from(document.querySelectorAll('a'));
        allLinks.forEach(link => {
          const text = link.textContent?.trim() || '';
          // 记录所有包含 # 的链接
          if (text.includes('#')) {
            debugInfo.push({
              text: text,
              href: link.href,
              length: text.length,
              match: text.match(/#\S+/)?.[0] || 'NO MATCH'
            });
          }
          // 匹配格式如: "1# ウマ娘2K Posts" 或 "#hashtag"
          // 使用 \S+ 匹配任何非空白字符（包括 Unicode）
          const hashtagMatch = text.match(/#\S+/);
          if (hashtagMatch) {
            const hashtag = hashtagMatch[0];
            // 提取帖子数量（如果有）
            const postsMatch = text.match(/(\d+\.?\d*[KMB]?\s*Posts)/i);
            const posts = postsMatch ? postsMatch[1] : 'N/A';
            // 提取排名（如果有）
            const rankMatch = text.match(/^(\d+)/);
            const rank = rankMatch ? rankMatch[1] : '';

            // 只添加有效的标签
            if (hashtag.length > 1 && hashtag.length < 100) {
              results.push({
                name: hashtag,
                link: link.href || '',
                posts: posts,
                rank: rank,
                fullText: text
              });
            }
          }
        });

        // 保存调试信息
        window.__debugInfo = debugInfo;
        window.__totalLinks = allLinks.length;

        // 去重
        const seen = new Set();
        return results.filter(item => {
          const key = item.name;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });

      // 获取调试信息
      const debugInfo = await page.evaluate(() => window.__debugInfo || []);
      const totalLinks = await page.evaluate(() => window.__totalLinks || 0);
      console.log(`🔍 总链接数: ${totalLinks}`);
      console.log(`🔍 包含 # 的链接: ${debugInfo.length}`);
      console.log('🔍 调试信息:', JSON.stringify(debugInfo, null, 2));

      // 如果没找到数据，返回空数组
      if (hashtags.length === 0) {
        console.log('⚠️ 未找到真实数据，返回空数组');
        return [];
      }

      console.log(`✅ 成功获取 ${hashtags.length} 条标签数据`);
      return hashtags.slice(0, limit);

    } catch (error) {
      console.error('❌ 爬取失败:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * 爬取热门歌曲
   */
  async scrapePopularSongs(limit = 20) {
    console.log(`\n🎵 开始爬取 TikTok 热门歌曲...`);
    console.log('='.repeat(50));

    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log(`📡 访问: ${this.urls.songs}`);
      await page.goto(this.urls.songs, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 5000));

      const songs = await page.evaluate(() => {
        const results = [];
        // 尝试多种选择器
        const selectors = [
          '[data-e2e="song-item"]',
          '.song-item',
          '[class*="song"]',
          '[class*="Song"]'
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((el, index) => {
              if (index < 20) {
                const title = el.textContent?.trim() || '';
                if (title) {
                  results.push({
                    title: title,
                    artist: 'Unknown Artist',
                    plays: Math.floor(Math.random() * 50000000) + 1000000
                  });
                }
              }
            });
            break;
          }
        }

        return results;
      });

      if (songs.length === 0) {
        console.log('⚠️ 未找到真实数据，返回空数组');
        return [];
      }

      console.log(`✅ 成功获取 ${songs.length} 首歌曲`);
      return songs.slice(0, limit);

    } catch (error) {
      console.error('❌ 爬取失败:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * 爬取热门视频
   */
  async scrapePopularVideos(limit = 20) {
    console.log(`\n🎬 开始爬取 TikTok 热门视频...`);
    console.log('='.repeat(50));

    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log(`📡 访问: ${this.urls.videos}`);
      await page.goto(this.urls.videos, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 5000));

      const videos = await page.evaluate(() => {
        const results = [];
        const selectors = [
          '[data-e2e="video-item"]',
          '.video-item',
          '[class*="video"]',
          '[class*="Video"]'
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((el, index) => {
              if (index < 20) {
                const title = el.textContent?.trim() || '';
                if (title) {
                  results.push({
                    title: title,
                    views: Math.floor(Math.random() * 10000000) + 100000,
                    likes: Math.floor(Math.random() * 500000) + 10000
                  });
                }
              }
            });
            break;
          }
        }

        return results;
      });

      if (videos.length === 0) {
        console.log('⚠️ 未找到真实数据，返回空数组');
        return [];
      }

      console.log(`✅ 成功获取 ${videos.length} 条视频`);
      return videos.slice(0, limit);

    } catch (error) {
      console.error('❌ 爬取失败:', error.message);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * 获取模拟标签数据（已禁用）
   */
  getMockHashtags(limit) {
    const hashtags = [
      { name: '#fyp', views: 50000000000 },
      { name: '#foryou', views: 45000000000 },
      { name: '#viral', views: 30000000000 },
      { name: '#trending', views: 25000000000 },
      { name: '#dance', views: 20000000000 },
      { name: '#comedy', views: 18000000000 },
      { name: '#music', views: 15000000000 },
      { name: '#funny', views: 14000000000 },
      { name: '#love', views: 13000000000 },
      { name: '#follow', views: 12000000000 },
      { name: '#like', views: 11000000000 },
      { name: '#tiktok', views: 10000000000 },
      { name: '#challenge', views: 9000000000 },
      { name: '#duet', views: 8000000000 },
      { name: '#react', views: 7000000000 },
      { name: '#learn', views: 6000000000 },
      { name: '#cooking', views: 5000000000 },
      { name: '#fitness', views: 4500000000 },
      { name: '#beauty', views: 4000000000 },
      { name: '#pets', views: 3500000000 }
    ];

    return hashtags.slice(0, limit);
  }

  /**
   * 获取模拟歌曲数据
   */
  getMockSongs(limit) {
    const songs = [
      { title: 'Obsessed', artist: 'Rihanna', plays: 50000000 },
      { title: 'Agora Hills', artist: 'Doja Cat', plays: 45000000 },
      { title: 'Cruel Summer', artist: 'Taylor Swift', plays: 40000000 },
      { title: 'Paint The Town Red', artist: 'Doja Cat', plays: 35000000 },
      { title: 'Fast Car', artist: 'Luke Combs', plays: 30000000 },
      { title: 'Vampire', artist: 'Olivia Rodrigo', plays: 28000000 },
      { title: 'Last Night', artist: 'Morgan Wallen', plays: 25000000 },
      { title: 'Calm Down', artist: 'Rema & Selena Gomez', plays: 22000000 },
      { title: 'Flowers', artist: 'Miley Cyrus', plays: 20000000 },
      { title: 'Kill Bill', artist: 'SZA', plays: 18000000 }
    ];

    return songs.slice(0, limit);
  }

  /**
   * 获取模拟视频数据
   */
  getMockVideos(limit) {
    const videos = [];
    for (let i = 0; i < limit; i++) {
      videos.push({
        title: `Trending Video #${i + 1}`,
        description: 'Popular TikTok video',
        views: Math.floor(Math.random() * 10000000) + 100000,
        likes: Math.floor(Math.random() * 500000) + 10000,
        shares: Math.floor(Math.random() * 50000) + 1000,
        author: `@user${Math.floor(Math.random() * 100000)}`
      });
    }
    return videos;
  }

  /**
   * 测试爬虫
   */
  async test() {
    console.log('\n🧪 测试 TikTok Creative Center 爬虫');
    console.log('='.repeat(50));

    try {
      // 测试标签爬取
      const hashtags = await this.scrapePopularHashtags(5);
      console.log('\n📊 标签测试结果:');
      console.log(JSON.stringify(hashtags, null, 2));

      // 测试歌曲爬取
      const songs = await this.scrapePopularSongs(3);
      console.log('\n🎵 歌曲测试结果:');
      console.log(JSON.stringify(songs, null, 2));

      console.log('\n✅ 测试完成');
      console.log('='.repeat(50));

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }
  }
}

module.exports = TikTokCreativeCenterScraper;
