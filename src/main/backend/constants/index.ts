export const ALL_PLATFORMS = [
  {
    id: 'bilibili',
    name: 'bilibili',
  },
  {
    id: 'douyin',
    name: '抖音',
  },
  {
    id: 'douyin_mp',
    name: '抖音企业号',
  },
  {
    id: 'win_jinmai',
    name: '京卖',
  },
  {
    id: 'jinritemai',
    name: '抖店',
  },
  {
    id: 'win_qianniu',
    name: '千牛',
  },
  {
    id: 'win_wechat',
    name: '微信',
  },
  {
    id: 'win_wecom',
    name: '企微(Bate版)',
  },
  {
    id: 'weibo',
    name: '微博私信',
  },
  {
    id: 'xiaohongshu',
    name: '小红书评论',
  },
  {
    id: 'xiaohongshu_pro',
    name: '小红书私信',
  },
  {
    id: 'zhihu',
    name: '知乎',
  },
];

// 固定会传递的上下文参数
export const CTX_APP_NAME = 'app_name';
export const CTX_APP_ID = 'app_id';
export const CTX_INSTANCE_ID = 'instance_id';

export const CTX_USERNAME = 'username'; // 当前操作的用户名
export const CTX_PLATFORM = 'platform'; // 当前所在平台
export const CTX_HAS_NEW_MESSAGE = 'has_new_message'; // 是否有新消息
export const CTX_HAS_GROUP_MESSAGE = 'has_group_message'; // 是否有群消息

// 电商平台
export const CTX_CURRENT_GOODS = 'CTX_CURRENT_GOODS'; // 当前商品
export const CTX_CURRENT_GOODS_ID = 'CTX_CURRENT_GOODS_ID'; // 当前商品 ID
export const CTX_MEMBER_TAG = 'CTX_MEMBER_TAG'; // 会员标签
export const CTX_FAN_TAG = 'CTX_FAN_TAG'; // 粉丝标签
export const CTX_NEW_CUSTOMER_TAG = 'CTX_NEW_CUSTOMER_TAG'; // 新客标签

export const PluginDefaultRunCode = `
const cc = require('config_srv');
const rp = require('reply_srv');

/**
 * 插件主函数
 * @param {AppContext} ctx - 上下文信息
 * @param {Message[]} messages - 消息数组
 * @returns {Reply} 插件执行结果
 */
async function main(ctx, messages) {
  const appId = ctx.get('app_id');
  const instanceId = ctx.get('instance_id');

  const cfg = cc.get(ctx);

  console.log('插件开始执行....');
  console.log('当前应用 ID:', appId);
  console.log('当前客服实例 ID:', instanceId);
  console.log('当前配置:', ctx, messages);

  // 先检查是否存在用户的消息
  const lastUserMsg = messages
    .slice()
    .reverse()
    .find((msg) => msg.role === 'OTHER');

  if (!lastUserMsg) {
    return {
      type: 'TEXT',
      content: cfg.default_reply, // 默认回复
    };
  }

  // 等待随机时间
  await new Promise((resolve) => {
    const min = cfg.reply_speed;
    const max = cfg.reply_random_speed + cfg.reply_speed;
    const randomTime = min + Math.random() * (max - min);
    setTimeout(resolve, randomTime * 1000);
  });

  // 再检查是否使用关键词匹配
  if (rp.isKeywordMatch) {
    const data = await rp.matchKeyword(ctx, lastUserMsg);
    if (data) return data;
  }

  // 最后检查是否使用 GPT 生成回复
  if (rp.isUseGptReply) {
    const data = await rp.getLLMResponse(cfg, ctx, messages);
    if (data) return data;
  }

  return {
    type: 'TEXT',
    content: cfg.default_reply,
  };
}`;
