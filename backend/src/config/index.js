// 应用配置
module.exports = {
  // 数据源配置
  dataSource: process.env.DATA_SOURCE || 'mock',

  // 更新频率
  updateInterval: process.env.UPDATE_INTERVAL || 'weekly',

  // 地区配置
  regions: {
    'north-america': {
      name: '北美',
      nameEn: 'North America',
      flag: '🇺🇸',
      timezone: 'America/New_York',
      exportPotential: 'high' // 出口潜力
    },
    'europe': {
      name: '欧洲',
      nameEn: 'Europe',
      flag: '🇪🇺',
      timezone: 'Europe/London',
      exportPotential: 'high'
    },
    'southeast-asia': {
      name: '东南亚',
      nameEn: 'Southeast Asia',
      flag: '🇸🇬',
      timezone: 'Asia/Singapore',
      exportPotential: 'medium'
    },
    'africa': {
      name: '非洲',
      nameEn: 'Africa',
      flag: '🇿🇦',
      timezone: 'Africa/Johannesburg',
      exportPotential: 'emerging' // 新兴市场
    }
  },

  // 行业分类（B2B工厂）
  industries: [
    { id: 'textile', name: '纺织服装', icon: '👔', keywords: ['textile', 'garment', 'fabric', 'clothing'] },
    { id: 'electronics', name: '电子数码', icon: '📱', keywords: ['electronics', 'circuit', 'chip', 'pcb'] },
    { id: 'machinery', name: '机械制造', icon: '⚙️', keywords: ['machinery', 'equipment', 'manufacturing', 'factory'] },
    { id: 'chemical', name: '化工材料', icon: '🧪', keywords: ['chemical', 'plastic', 'rubber', 'material'] },
    { id: 'home', name: '家居用品', icon: '🏠', keywords: ['home', 'furniture', 'decor', 'household'] },
    { id: 'food', name: '食品饮料', icon: '🍜', keywords: ['food', 'beverage', 'snack', 'drink'] },
    { id: 'auto', name: '汽车配件', icon: '🚗', keywords: ['auto', 'car', 'vehicle', 'parts'] },
    { id: 'construction', name: '建筑材料', icon: '🏗️', keywords: ['construction', 'building', 'material'] }
  ],

  // 搜索关键词（B2B相关）
  searchKeywords: [
    'factory', 'manufacturer', 'wholesale',
    'supplier', 'exporter', 'b2b',
    'made in china', 'factory direct',
    'OEM', 'ODM', 'private label'
  ]
};
