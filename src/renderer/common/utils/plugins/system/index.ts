import { WECHAT_NEWS_PLUGIN } from './wechat';
import { QIANNIU_GOODS_PLUGIN } from './qianniu';

// 转换为 JSON 格式
// https://www.lambdatest.com/free-online-tools/json-escape
export const SystemPluginList = [
  {
    type: 'guide',
    title: '我有兴趣为懒人客服\n贡献工具',
    description: '',
    tags: [],
    icon: '📘',
  },
  {
    type: 'plugin',
    title: '微信热榜播报插件',
    author: '系统插件',
    description: '当用户使用 @BOT 并且携带 [热榜] 关键字时，将会触发此插件。',
    tags: ['微信', '热榜', '机器人'],
    code: WECHAT_NEWS_PLUGIN,
    icon: '📰',
  },
  {
    type: 'plugin',
    title: '千牛商品查询插件',
    author: '系统插件',
    description:
      '会携带商品名称，商品 ID 等信息去询问 GPT 知识库（需要自己配置知识库）',
    tags: ['千牛', '商品', '机器人'],
    code: QIANNIU_GOODS_PLUGIN,
    icon: '🎁',
  },
];
