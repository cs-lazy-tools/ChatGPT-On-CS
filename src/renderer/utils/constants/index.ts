export const PluginExtraLib = `
      type AppContext = {
        app_name: string; // 当前应用名称
        app_id: string; // 当前应用 ID
        instance_id: string; // 当前客服实例 ID
        username?: string; // 当前操作的用户名
        platform?: string; // 当前所在平台
        has_new_message?: boolean; // 是否有新消息
        has_group_message?: boolean; // 是否有群消息
        CTX_CURRENT_GOODS?: string; // 当前商品
        CTX_CURRENT_GOODS_ID?: string; // 当前商品 ID
        CTX_MEMBER_TAG?: string; // 会员标签
        CTX_FAN_TAG?: string; // 粉丝标签
        CTX_NEW_CUSTOMER_TAG?: string; // 新客标签
      };

      type RoleType = 'SELF' | 'OTHER' | 'SYSTEM';

      type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';

      type Message = {
        sender: string; // 发送者
        content: string; // 消息内容
        role: RoleType; // 发送者角色
        type: MessageType; // 消息类型
      };

      type Reply = {
        content: string; // 回复内容
        type: MessageType; // 回复类型
      };
      `;

export const PluginExampleCode = `/**
 * 插件主函数
 * @param {AppContext} ctx - 上下文信息
 * @param {Message[]} messages - 消息数组
 * @returns {Reply} 插件执行结果
 */
function main(ctx, messages) {
  const appId = ctx.app_id;
  const instanceId = ctx.instance_id;

  const cfg = cc.get(ctx);

  return {
    content: 'Hello, world!',
    type: 'TEXT',
  };
}`;

export const LLMTypeList = [
  {
    key: 'openai',
    name: 'OpenAI',
  },
  {
    key: 'ernie',
    name: '文心大模型',
  },
  {
    key: 'gemini',
    name: 'Google Gemini',
  },
  {
    key: 'hunyuan',
    name: '腾讯混元',
  },
  {
    key: 'minimax',
    name: 'MiniMax',
  },
  {
    key: 'qwen',
    name: '通义千问',
  },
  {
    key: 'spark',
    name: 'Spark',
  },
  {
    key: 'vyro',
    name: 'Vyro AI',
  },
  {
    key: 'dify',
    name: 'Dify AI',
  },
  {
    key: 'fastgpt',
    name: 'FastGPT',
  },
];

export const ModelList = [
  {
    key: 'gpt-4',
    name: 'OpenAI GPT-4',
  },
  {
    key: 'gpt-3.5-turbo',
    name: 'OpenAI GPT-3.5 Turbo',
  },
  {
    key: 'claude-3',
    name: 'Anthropic Claude 3',
  },
  {
    key: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro',
  },
  {
    key: 'bard',
    name: 'Google Bard',
  },
  {
    key: 'vicuna-1.3',
    name: 'Vicuna 1.3',
  },
  {
    key: 'palm-2',
    name: 'Google PaLM 2',
  },
  {
    key: 'llama-2',
    name: 'Meta LLaMA 2',
  },
  {
    key: 'dolly',
    name: 'Databricks Dolly',
  },
  {
    key: 'open-assistant',
    name: 'Open Assistant',
  },
  {
    key: 'mixtral-8x7b',
    name: 'Mistral Mixtral-8x7B',
  },
  {
    key: 'falcon-180b',
    name: 'Falcon 180B',
  },
  {
    key: 'wenxin-3.0',
    name: 'Baidu Wenxin 3.0 (Ernie)',
  },
  {
    key: 'm6',
    name: 'Alibaba M6',
  },
  {
    key: 'pangubot',
    name: 'Tencent PanguBot',
  },
  {
    key: 'huaweilinxi',
    name: 'Huawei Linxi AI',
  },
  {
    key: 'ziya-1.0',
    name: 'Ziya 1.0 (Zhipu AI)',
  },
  {
    key: 'imagebind',
    name: 'Meta ImageBind',
  },
  {
    key: 'gen-2',
    name: 'Runway Gen-2',
  },
];
