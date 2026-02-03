// TikTok Crawler Service - 基于 Douyin_TikTok_Download_API
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * TikTok Crawler Service
 *
 * 这个服务封装了 Douyin_TikTok_Download_API 的调用
 * API 地址：https://github.com/Evil0ctal/Douyin_TikTok_Download_API
 *
 * 环境变量：
 * - TIKTOK_API_URL: Douyin_TikTok_Download_API 服务地址 (默认: http://localhost:8000)
 * - TIKTOK_COOKIE: TikTok Cookie (可选，用于需要登录的接口)
 */
class TikTokCrawler {
  constructor() {
    this.apiUrl = process.env.TIKTOK_API_URL || 'http://localhost:8000';
    this.cookie = process.env.TIKTOK_COOKIE || '';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 健康检查 - 检查 API 服务是否可用
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`TikTok API 服务不可用: ${error.message}`);
    }
  }

  /**
   * 获取 TikTok Creative Center 热门标签数据
   * @param {Object} options - 查询选项
   * @param {string} options.region - 地区代码 (us, gb, ca, au, etc.)
   * @param {number} options.period - 时间周期 (1=今天, 7=本周, 30=本月)
   * @param {string} options.device - 设备类型 (android, ios)
   */
  async getTrendingHashtags(options = {}) {
    const {
      region = 'us',
      period = 7,
      device = 'android'
    } = options;

    try {
      const response = await axios.get(`${this.apiUrl}/api/creative-center/hashtags`, {
        params: { region, period, device },
        headers: this._getHeaders(),
        timeout: 15000
      });

      return this._transformHashtags(response.data);
    } catch (error) {
      console.error('获取热门标签失败:', error.message);
      throw this._handleError(error);
    }
  }

  /**
   * 获取 TikTok Creative Center 热门音乐数据
   * @param {Object} options - 查询选项
   */
  async getTrendingSongs(options = {}) {
    const {
      region = 'us',
      period = 7,
      device = 'android'
    } = options;

    try {
      const response = await axios.get(`${this.apiUrl}/api/creative-center/songs`, {
        params: { region, period, device },
        headers: this._getHeaders(),
        timeout: 15000
      });

      return this._transformSongs(response.data);
    } catch (error) {
      console.error('获取热门音乐失败:', error.message);
      throw this._handleError(error);
    }
  }

  /**
   * 获取 TikTok Creative Center 热门视频数据
   * @param {Object} options - 查询选项
   */
  async getTrendingVideos(options = {}) {
    const {
      region = 'us',
      period = 7,
      device = 'android'
    } = options;

    try {
      const response = await axios.get(`${this.apiUrl}/api/creative-center/videos`, {
        params: { region, period, device },
        headers: this._getHeaders(),
        timeout: 15000
      });

      return this._transformVideos(response.data);
    } catch (error) {
      console.error('获取热门视频失败:', error.message);
      throw this._handleError(error);
    }
  }

  /**
   * 搜索 TikTok 用户或内容
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 查询选项
   */
  async search(keyword, options = {}) {
    const {
      type = 'video', // video, user, hashtag, sound
      count = 20,
      region = 'us'
    } = options;

    try {
      const response = await axios.get(`${this.apiUrl}/api/search`, {
        params: { keyword, type, count, region },
        headers: this._getHeaders(),
        timeout: 15000
      });

      return this._transformSearchResults(response.data, type);
    } catch (error) {
      console.error('搜索失败:', error.message);
      throw this._handleError(error);
    }
  }

  /**
   * 获取用户详细信息
   * @param {string} username - TikTok 用户名
   */
  async getUserInfo(username) {
    try {
      const response = await axios.get(`${this.apiUrl}/api/user/detail`, {
        params: { username },
        headers: this._getHeaders(),
        timeout: 15000
      });

      return this._transformUserInfo(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      throw this._handleError(error);
    }
  }

  /**
   * 获取用户视频列表
   * @param {string} username - TikTok 用户名
   * @param {number} count - 获取数量
   */
  async getUserVideos(username, count = 20) {
    try {
      const response = await axios.get(`${this.apiUrl}/api/user/videos`, {
        params: { username, count },
        headers: this._getHeaders(),
        timeout: 15000
      });

      return this._transformVideos(response.data);
    } catch (error) {
      console.error('获取用户视频失败:', error.message);
      throw this._handleError(error);
    }
  }

  /**
   * 批量收集热点数据（定时任务使用）
   * @param {Array} regions - 地区代码数组
   * @param {Object} options - 选项
   */
  async batchCollect(regions, options = {}) {
    const {
      includeHashtags = true,
      includeSongs = true,
      includeVideos = true,
      period = 7
    } = options;

    const results = {
      timestamp: new Date().toISOString(),
      regions: [],
      errors: []
    };

    for (const region of regions) {
      const regionData = {
        region,
        data: {}
      };

      try {
        if (includeHashtags) {
          regionData.data.hashtags = await this.getTrendingHashtags({ region, period });
        }
        if (includeSongs) {
          regionData.data.songs = await this.getTrendingSongs({ region, period });
        }
        if (includeVideos) {
          regionData.data.videos = await this.getTrendingVideos({ region, period });
        }

        results.regions.push(regionData);

        // 添加延迟避免请求过快
        await this._delay(1000);
      } catch (error) {
        results.errors.push({
          region,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 构建请求头
   * @private
   */
  _getHeaders() {
    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json'
    };

    if (this.cookie) {
      headers['Cookie'] = this.cookie;
    }

    return headers;
  }

  /**
   * 转换标签数据格式
   * @private
   */
  _transformHashtags(data) {
    if (!data || !data.data) return [];

    return data.data.map((item, index) => ({
      id: `hashtag_${item.id || index}`,
      type: 'hashtag',
      rank: index + 1,
      title: item.name || item.hashtag_name || '',
      description: item.description || '',
      views: this._parseNumber(item.views || item.view_count),
      growth: this._parseNumber(item.growth || item.growth_rate),
      coverImage: item.cover || item.image || '',
      stats: {
        views: this._parseNumber(item.views),
        videos: this._parseNumber(item.video_count),
        growth: this._parseNumber(item.growth)
      },
      url: item.url || item.share_url || '',
      region: item.region || '',
      collectedAt: new Date().toISOString()
    }));
  }

  /**
   * 转换音乐数据格式
   * @private
   */
  _transformSongs(data) {
    if (!data || !data.data) return [];

    return data.data.map((item, index) => ({
      id: `song_${item.id || index}`,
      type: 'song',
      rank: index + 1,
      title: item.title || item.song_name || '',
      description: item.artist || item.author || '',
      coverImage: item.cover || item.album_cover || '',
      stats: {
        views: this._parseNumber(item.views),
        videos: this._parseNumber(item.video_count),
        growth: this._parseNumber(item.growth)
      },
      audioUrl: item.url || item.play_url || '',
      region: item.region || '',
      collectedAt: new Date().toISOString()
    }));
  }

  /**
   * 转换视频数据格式
   * @private
   */
  _transformVideos(data) {
    if (!data || !data.data) return [];

    return data.data.map((item, index) => ({
      id: `video_${item.id || index}`,
      type: 'video',
      rank: index + 1,
      title: item.desc || item.title || item.description || '',
      description: item.desc || '',
      coverImage: item.cover || item.thumbnail || item.origin_cover || '',
      stats: {
        views: this._parseNumber(item.stats?.play_count || item.play_count || item.views),
        likes: this._parseNumber(item.stats?.digg_count || item.digg_count || item.likes),
        comments: this._parseNumber(item.stats?.comment_count || item.comment_count),
        shares: this._parseNumber(item.stats?.share_count || item.share_count),
        growth: this._parseNumber(item.growth || 0)
      },
      video: {
        url: item.video_url || item.play_url || '',
        duration: item.duration || item.video_duration || 0,
        height: item.video_height || 1080,
        width: item.video_width || 1920
      },
      author: {
        username: item.author?.nickname || item.nickname || '',
        uniqueId: item.author?.unique_id || item.unique_id || '',
        avatar: item.author?.avatar_thumb || item.avatar || '',
        signature: item.author?.signature || ''
      },
      music: {
        id: item.music?.id || '',
        title: item.music?.title || item.music_title || '',
        author: item.music?.author || item.music_author || '',
        cover: item.music?.cover_thumb || item.music_cover || ''
      },
      product: item.product_info || null,
      region: item.region || '',
      url: item.share_url || item.web_share_url || '',
      collectedAt: new Date().toISOString()
    }));
  }

  /**
   * 转换用户信息格式
   * @private
   */
  _transformUserInfo(data) {
    if (!data || !data.data) return null;

    const user = data.data;
    return {
      id: user.id || user.unique_id,
      username: user.unique_id || '',
      nickname: user.nickname || '',
      avatar: user.avatar_thumb || user.avatar_larger || '',
      signature: user.signature || '',
      stats: {
        followers: this._parseNumber(user.stats?.follower_count || user.follower_count),
        following: this._parseNumber(user.stats?.following_count || user.following_count),
        hearts: this._parseNumber(user.stats?.heart_count || user.heart_count),
        videos: this._parseNumber(user.stats?.video_count || user.video_count)
      },
      isVerified: user.is_verified || user.verified || false,
      region: user.region || '',
      collectedAt: new Date().toISOString()
    };
  }

  /**
   * 转换搜索结果格式
   * @private
   */
  _transformSearchResults(data, type) {
    if (!data || !data.data) return [];

    switch (type) {
      case 'video':
        return this._transformVideos(data);
      case 'hashtag':
        return this._transformHashtags(data);
      case 'sound':
        return this._transformSongs(data);
      default:
        return data.data || [];
    }
  }

  /**
   * 解析数字（处理 K, M, B 后缀）
   * @private
   */
  _parseNumber(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;

    const str = String(value).toUpperCase();
    const multiplier = {
      'K': 1000,
      'M': 1000000,
      'B': 1000000000
    };

    const match = str.match(/^([\d.]+)([KMB]?)$/);
    if (match) {
      const num = parseFloat(match[1]);
      const suffix = match[2];
      return suffix ? Math.floor(num * multiplier[suffix]) : Math.floor(num);
    }

    return parseInt(str.replace(/,/g, '')) || 0;
  }

  /**
   * 错误处理
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // API 返回了错误响应
      return new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      // 请求发送但没有收到响应
      return new Error('API 服务无响应，请检查服务是否启动');
    } else {
      // 其他错误
      return error;
    }
  }

  /**
   * 延迟函数
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
module.exports = new TikTokCrawler();
