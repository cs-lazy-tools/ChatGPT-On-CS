export const WECHAT_NEWS_PLUGIN = `const cc = require('config_srv');
const rp = require('reply_srv');
const axios = require('axios');

/**
 * 插件主函数
 * @param {AppContext} ctx - 上下文信息
 * @param {Message[]} messages - 消息数组
 * @returns {Reply} 插件执行结果
 */
async function main(ctx, messages) {
  const appId = ctx.get('app_id');
  const cfg = cc.get(ctx);

  if (appId === 'win_wechat') {
    // 取得用户最后一条消息
    const lastMessage = messages[messages.length - 1];

    // 可以取得它的消息内容
    const hasGroup = ctx.get('CTX_HAS_GROUP_MESSAGE');

    // 检查当前消息是否携带 @BOT 指令
    const hasBotCommand = lastMessage.content.includes('@BOT');

    // 如果还携带了 [热榜] 关键词
    const hasNewsKeyword = lastMessage.content.includes('[热榜]');

    if (hasGroup && hasBotCommand && hasNewsKeyword) {
      try {
        // 使用 axios 请求新闻数据
        const response = await axios.get('https://api.vvhan.com/api/hotlist/all');
        const newsData = response.data;

        if (newsData.success) {
          const newsList = newsData.data;
          let replyContent = \`\${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}\\n\\n\`;

          // 遍历每个平台的新闻
          newsList.forEach(platform => {
            replyContent += \`\${platform.name} \${platform.subtitle} 更新于 \${platform.update_time}\\n\`;
            platform.data.slice(0, 3).forEach((news, index) => {
              replyContent += \`\${index + 1}. \${news.title} 热度: \${news.hot}\\n\`;
            });
            replyContent += '\\n';
          });

          // 发送回复
          return rp.createTextReply(replyContent);
        } else {
          return rp.createTextReply('无法获取新闻数据，请稍后再试。');
        }
      } catch (error) {
        console.error('获取新闻数据出错:', error);
        return rp.createTextReply('获取新闻数据时出错，请稍后再试。');
      }
    }
  }

  // 默认回复
  const reply = await rp.getDefaultReply(cfg, ctx, messages);
  return reply;
}
`;
