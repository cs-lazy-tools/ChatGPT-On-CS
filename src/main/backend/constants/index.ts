// 固定会传递的上下文参数
export const CTX_APP_NAME = 'CTX_APP_NAME';
export const CTX_APP_ID = 'CTX_APP_ID';
export const CTX_INSTANCE_ID = 'CTX_INSTANCE_ID';

export const CTX_USERNAME = 'CTX_USERNAME'; // 当前操作的用户名
export const CTX_PLATFORM = 'CTX_PLATFORM'; // 当前所在平台
export const CTX_HAS_NEW_MESSAGE = 'CTX_HAS_NEW_MESSAGE'; // 是否有新消息
export const CTX_HAS_GROUP_MESSAGE = 'CTX_HAS_GROUP_MESSAGE'; // 是否有群消息

// 电商平台
export const CTX_CURRENT_GOODS = 'CTX_CURRENT_GOODS'; // 当前商品
export const CTX_CURRENT_GOODS_ID = 'CTX_CURRENT_GOODS_ID'; // 当前商品 ID
export const CTX_MEMBER_TAG = 'CTX_MEMBER_TAG'; // 会员标签
export const CTX_FAN_TAG = 'CTX_FAN_TAG'; // 粉丝标签
export const CTX_NEW_CUSTOMER_TAG = 'CTX_NEW_CUSTOMER_TAG'; // 新客标签

export const CTX_ORDER_STATUS = 'CTX_ORDER_STATUS'; // 订单状态
export const CTX_ORDER_ID = 'CTX_ORDER_ID'; // 订单 ID
export const CTX_ORDER_AMOUNT = 'CTX_ORDER_AMOUNT'; // PDD 平台特有 [订单金额]
export const CTX_GOODS_SPEC = 'CTX_GOODS_SPEC'; // PDD 平台特有 [商品规格]
export const CTX_LOGISTICS_STATUS = 'CTX_LOGISTICS_STATUS'; // 物流状态

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
  const cfg = await cc.get(ctx);
  return await rp.getReply(cfg, ctx, messages);
}`;
