export const QIANNIU_GOODS_PLUGIN = `const cc = require('config_srv');
const rp = require('reply_srv');

/**
 * 插件主函数
 * @param {AppContext} ctx - 上下文信息
 * @param {Message[]} messages - 消息数组
 * @returns {Reply} 插件执行结果
 */
async function main(ctx, messages) {
  const appId = ctx.get('app_id');
  const cfg = cc.get(ctx);

  if (appId === 'win_qianniu') {
    // 取得用户最后一条消息
    const lastMessage = messages[messages.length - 1];

    // 可以取得它的消息内容
    const goodsId = ctx.get('CTX_CURRENT_GOODS_ID');
    const goodsName = ctx.get('CTX_CURRENT_GOODS');

    // 构建一个消息
    const msg = {
      sender: 'SYSTEM',
      role: 'OTHER',
      content: \`1. 当前客户询问的商品 ID 是：
"""
\${goodsId}
"""

2. 咨询的商品名称是：
"""
\${goodsName}
"""

3. 当前客户的问题是：
"""
\${lastMessage.content}
"""
\`,
      type: 'TEXT',
    };

    // 替换用户的这条消息
    messages = [msg];
    const reply = await rp.getDefaultReply(cfg, ctx, messages);
    return reply;
  }
  const reply = await rp.getDefaultReply(cfg, ctx, messages);
  return reply;
}
`;
