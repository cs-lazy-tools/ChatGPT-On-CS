export const PluginExtraLib = `
      type AppContext = {
        CTX_APP_NAME: string; // 当前应用名称
        CTX_APP_ID: string; // 当前应用 ID
        CTX_INSTANCE_ID: string; // 当前客服实例 ID
        CTX_USERNAME?: string; // 当前操作的用户名
        CTX_PLATFORM?: string; // 当前所在平台
        CTX_HAS_NEW_MESSAGE?: boolean; // 是否有新消息
        CTX_HAS_GROUP_MESSAGE?: boolean; // 是否有群消息
        CTX_CURRENT_GOODS?: string; // 当前商品
        CTX_CURRENT_GOODS_ID?: string; // 当前商品 ID
        CTX_MEMBER_TAG?: string; // 会员标签
        CTX_FAN_TAG?: string; // 粉丝标签
        CTX_NEW_CUSTOMER_TAG?: string; // 新客标签
        CTX_ORDER_STATUS?: string; // 订单状态
        CTX_ORDER_ID?: string; // 订单 ID
        CTX_ORDER_AMOUNT?: string; // PDD 平台特有 [订单金额]
        CTX_GOODS_SPEC?: string; // PDD 平台特有 [商品规格]
        CTX_LOGISTICS_STATUS?: string; // 物流状态
      };

      type RoleType = 'SELF' | 'OTHER' | 'SYSTEM';

      type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'NO_REPLY';

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

export const PluginExampleCode = `const cc = require('config_srv');
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

export const ContextKeys = [
  CTX_APP_NAME,
  CTX_APP_ID,
  CTX_INSTANCE_ID,
  CTX_USERNAME,
  CTX_PLATFORM,
  CTX_HAS_NEW_MESSAGE,
  CTX_HAS_GROUP_MESSAGE,
  CTX_CURRENT_GOODS,
  CTX_CURRENT_GOODS_ID,
  CTX_MEMBER_TAG,
  CTX_FAN_TAG,
  CTX_NEW_CUSTOMER_TAG,
  CTX_ORDER_STATUS,
  CTX_ORDER_ID,
  CTX_ORDER_AMOUNT,
  CTX_GOODS_SPEC,
  CTX_LOGISTICS_STATUS,
];

export const MockCtx = new Map<string, string>([
  [CTX_APP_NAME, 'mock'],
  [CTX_APP_ID, 'mock_app_id'],
  [CTX_INSTANCE_ID, 'mock_instance_id'],
]);

export const MockMessages = [
  {
    sender: 'SELF用户',
    content: '这是一条测试消息',
    role: 'SELF',
    type: 'TEXT',
  },
  {
    sender: 'SYSTEM通知',
    content: '这是一条系统消息',
    role: 'SYSTEM',
    type: 'TEXT',
  },
  {
    sender: 'OTHER用户',
    content: '这是一条测试消息',
    role: 'OTHER',
    type: 'TEXT',
  },
];
