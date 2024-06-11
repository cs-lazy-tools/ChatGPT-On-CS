import fs from 'fs/promises';
import { ConfigController } from '../controllers/configController';
import { KeywordReplyController } from '../controllers/keywordReplyController';
import { MessageDTO, ReplyDTO, Context, MessageType } from '../types';
import { Config } from '../entities/config';

import {
  CTX_APP_ID,
  CTX_CURRENT_GOODS,
  CTX_CURRENT_GOODS_ID,
  CTX_MEMBER_TAG,
  CTX_FAN_TAG,
  CTX_NEW_CUSTOMER_TAG,
} from '../constants';
import { rangeMatch, specialTokenReplace } from '../../utils/strings';
import {
  ErnieAI,
  GeminiAI,
  HunYuanAI,
  MinimaxAI,
  OpenAI,
  QWenAI,
  SparkAI,
  VYroAI,
  DifyAI,
} from '../../gptproxy';

export class MessageService {
  private isKeywordMatch: boolean;

  private isUseGptReply: boolean;

  private configController: ConfigController;

  private autoReplyController: KeywordReplyController;

  private llmClientMap: Map<string, any>;

  constructor(
    configService: ConfigController,
    keywordReplyController: KeywordReplyController,
  ) {
    this.isKeywordMatch = true;
    this.isUseGptReply = true;
    this.configController = configService;
    this.autoReplyController = keywordReplyController;

    this.llmClientMap = new Map();
  }

  /**
   * 更新关键词匹配和 GPT 回复的状态
   * @param isKeywordMatch
   * @param isUseGptReply
   */
  public updateKeywordMatch(isKeywordMatch: boolean, isUseGptReply: boolean) {
    this.isKeywordMatch = isKeywordMatch;
    this.isUseGptReply = isUseGptReply;
  }

  /**
   * 匹配关键词
   * @param ctx
   * @param message
   * @returns
   */
  public async matchKeyword(
    ctx: Context,
    message: MessageDTO,
  ): Promise<ReplyDTO | null> {
    const appId = ctx.get(CTX_APP_ID);
    if (!appId) return null;

    const keywords = await this.autoReplyController.getKeywords(appId);

    // 先找到匹配的关键词
    const foundKeywordObj = keywords.find((keywordObj) => {
      return keywordObj.keyword.split('|').some((pattern) => {
        return rangeMatch(pattern, message.content);
      });
    });

    if (foundKeywordObj) {
      const replies = foundKeywordObj.reply.split('[or]');
      const chosenReply = specialTokenReplace(
        replies[Math.floor(Math.random() * replies.length)],
      );

      let msgType = 'TEXT';
      if (chosenReply.includes('[@]') && chosenReply.includes('[/@]')) {
        msgType = 'FILE';
        const fileStart = chosenReply.indexOf('[@]') + 3;
        const fileEnd = chosenReply.indexOf('[/@]');
        const filePath = chosenReply.substring(fileStart, fileEnd);
        return {
          type: msgType as MessageType,
          content: filePath,
        };
      }

      return {
        type: msgType as MessageType,
        content: chosenReply,
      };
    }

    return null;
  }

  /**
   * 获取 GPT 回复
   * @param cfg
   * @param ctx
   * @param messages
   * @returns
   */
  public async getLLMResponse(
    cfg: Config,
    ctx: Context,
    messages: MessageDTO[],
  ): Promise<ReplyDTO | null> {
    const llm_name = cfg.llm_type;
    if (!llm_name) {
      return null;
    }

    let llmClient = this.llmClientMap.get(llm_name);
    if (!llmClient) {
      llmClient = this.createLLMClient(cfg, llm_name);
      this.llmClientMap.set(llm_name, llmClient);
    }

    // 使用 completions 方法生成回复
    try {
      const response = await llmClient.chat.completions.create({
        model: cfg.model,
        messages: this.toLLMMessages(ctx, messages),
        stream: true,
      });

      const chunks = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of response) {
        chunks.push(chunk.choices[0]?.delta?.content || '');
      }

      return {
        type: 'TEXT',
        content: chunks.join(''),
      };
    } catch (error) {
      console.error(`Error in getLLMResponse: ${error}`);
    }

    return null;
  }

  /**
   * 创建 LLM 客户端
   * @param cfg
   * @param llmName
   * @returns
   */
  private createLLMClient(cfg: Config, llmName: string) {
    const { key: apiKey, base_url: baseURL } = cfg;
    const options = { apiKey, baseURL };

    if (llmName === 'ernie') {
      return new ErnieAI(options);
    }
    if (llmName === 'gemini') {
      return new GeminiAI(options);
    }
    if (llmName === 'hunyuan') {
      return new HunYuanAI(options);
    }
    if (llmName === 'minimax') {
      return new MinimaxAI(options);
    }
    if (llmName === 'qwen') {
      return new QWenAI(options);
    }
    if (llmName === 'spark') {
      return new SparkAI(options);
    }
    if (llmName === 'vyro') {
      return new VYroAI(options);
    }
    if (llmName === 'dify') {
      return new DifyAI(options);
    }

    return new OpenAI(options);
  }

  toLLMMessages(ctx: Context, messages: MessageDTO[]) {
    // 先过滤 system 消息
    const f_messages = messages.filter((msg) => msg.role !== 'SYSTEM');
    return f_messages.map((msg) => ({
      role: msg.role === 'SELF' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  /**
   * 提取消息中的信息
   * @param cfg
   * @param ctx
   * @param messages
   * @returns
   */
  public async extractMsgInfo(
    cfg: Config,
    ctx: Context,
    messages: MessageDTO[],
  ) {
    if (!cfg.extract_phone && !cfg.extract_product) return;
    if (cfg.save_path === '') return;

    console.log('开始提取用户消息中的数据....');

    const dataExtracted: { [key: string]: string } = {};
    const fileName = `${cfg.save_path}/${new Date().toISOString().split('T')[0]}.txt`;

    // 检查 save_path 是否存在
    try {
      await fs.access(cfg.save_path);
    } catch (error) {
      await fs.mkdir(cfg.save_path);
    }

    if (cfg.extract_phone) {
      const phoneNumbers = messages
        .map((msg) => msg.content.match(/\b1[3-9]\d{9}\b/g))
        .filter((pns) => pns)
        .flat();

      if (phoneNumbers.length)
        dataExtracted.phone_numbers = phoneNumbers.join(', ');
    }

    if (cfg.extract_product) {
      // 从 ctx 中获取商品信息
      const goods = ctx.get(CTX_CURRENT_GOODS);
      if (goods) {
        dataExtracted.goods = goods;
      }

      // 从 ctx 中获取商品 ID
      const goodsId = ctx.get(CTX_CURRENT_GOODS_ID);
      if (goodsId) {
        dataExtracted.goods_id = goodsId;
      }

      // 从 ctx 中获取会员标签
      const memberTag = ctx.get(CTX_MEMBER_TAG);
      if (memberTag) {
        dataExtracted.member_tag = memberTag;
      }

      // 从 ctx 中获取粉丝标签
      const fanTag = ctx.get(CTX_FAN_TAG);
      if (fanTag) {
        dataExtracted.fan_tag = fanTag;
      }

      // 从 ctx 中获取新客标签
      const newCustomerTag = ctx.get(CTX_NEW_CUSTOMER_TAG);
      if (newCustomerTag) {
        dataExtracted.new_customer_tag = newCustomerTag;
      }
    }

    await fs.appendFile(
      fileName,
      `${Object.entries(dataExtracted)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}\n`,
    );
  }
}
