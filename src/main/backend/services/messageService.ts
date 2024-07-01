import fs from 'fs/promises';
import { KeywordReplyController } from '../controllers/keywordReplyController';
import {
  MessageDTO,
  ReplyDTO,
  Context,
  MessageType,
  LLMConfig,
} from '../types';
import { Config } from '../entities/config';

import {
  CTX_APP_ID,
  CTX_CURRENT_GOODS,
  CTX_CURRENT_GOODS_ID,
  CTX_MEMBER_TAG,
  CTX_FAN_TAG,
  CTX_NEW_CUSTOMER_TAG,
} from '../constants';
import {
  rangeMatch,
  specialTokenReplace,
  replaceKeyword,
} from '../../utils/strings';
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
import { LoggerService } from './loggerService';

export class MessageService {
  private llmClientMap: Map<
    string,
    | ErnieAI
    | GeminiAI
    | HunYuanAI
    | MinimaxAI
    | OpenAI
    | QWenAI
    | SparkAI
    | VYroAI
    | DifyAI
  >;

  constructor(
    private log: LoggerService,
    private autoReplyController: KeywordReplyController,
  ) {
    this.log = log;
    this.autoReplyController = autoReplyController;

    this.llmClientMap = new Map();
  }

  /**
   * 获取默认回复
   * @param cfg
   * @param ctx
   * @param messages
   * @returns
   */
  public async getDefaultReply(cfg: Config): Promise<ReplyDTO> {
    let reply = {
      type: 'TEXT' as MessageType,
      content: cfg.default_reply || '当前消息有点多，我稍后再回复你',
    };

    const replyContent = await this.choseRandomReply(reply.content);
    reply = {
      type: reply.type as MessageType,
      content: replyContent,
    };

    return reply;
  }

  /**
   * 获取回复
   * @param cfg
   * @param ctx
   * @param messages
   * @returns
   */
  public async getReply(
    cfg: Config,
    ctx: Context,
    messages: MessageDTO[],
  ): Promise<ReplyDTO> {
    // 先检查是否存在用户的消息
    const lastUserMsg = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === 'OTHER');

    let hasDefaultReply = true;
    let reply = null;

    if (lastUserMsg) {
      if (cfg.has_transfer) {
        // 检查是否需要转接
        const isTransfer = await this.matchTransferKeyword(ctx, lastUserMsg);
        if (isTransfer) {
          this.log.info('需要转接');
          hasDefaultReply = false;
          return {
            type: 'TRANSFER' as MessageType,
            content: '无',
          };
        }
      }

      // 再根据 context_count 去保留最后几条消息
      if (cfg.context_count > 0) {
        // eslint-disable-next-line no-param-reassign
        messages = messages.slice(-cfg.context_count);
      }

      // 等待随机时间
      await new Promise((resolve) => {
        const min = cfg.reply_speed;
        const max = cfg.reply_random_speed + cfg.reply_speed;
        const randomTime = min + Math.random() * (max - min);
        setTimeout(resolve, randomTime * 1000);
      });

      // 再检查是否使用关键词匹配
      if (cfg.has_keyword_match) {
        const data = await this.matchKeyword(ctx, lastUserMsg);
        if (data && data.content) {
          this.log.success(`匹配关键词: ${data.content}`);
          reply = data;
          hasDefaultReply = false;
        } else {
          this.log.warn(`未匹配到关键词`);
        }
      }

      // 最后检查是否使用 GPT 生成回复
      if (cfg.has_use_gpt && hasDefaultReply) {
        this.log.info(`开始使用 GPT 生成回复`);

        const data = await this.getLLMResponse(cfg, ctx, messages);

        if (data && data.content) {
          this.log.success(`GPT 生成回复: ${data.content}`);
          reply = data;
          hasDefaultReply = false;
        } else {
          this.log.warn(`AI 回复生成失败`);
        }
      }
    }

    if (hasDefaultReply) {
      reply = await this.getDefaultReply(cfg);
      this.log.warn(`未匹配到用户消息，所以使用默认回复: ${reply.content}`);
    }

    if (cfg.has_replace) {
      if (reply && reply.type === 'TEXT') {
        reply.content = await this.matchReplaceKeyword(ctx, reply.content);
      }
    }

    return reply as ReplyDTO;
  }

  public async createTextReply(content: string) {
    return {
      type: 'TEXT',
      content,
    };
  }

  /**
   * 匹配需要替换的关键词
   * @param ctx
   * @param message
   * @returns
   */
  public async matchReplaceKeyword(
    ctx: Context,
    reply: string,
  ): Promise<string> {
    const appId = ctx.get(CTX_APP_ID);
    if (!appId) return reply;

    const replaceKeywords =
      await this.autoReplyController.getReplaceKeywords(appId);

    // 先找到匹配的关键词
    const foundKeywordObj = replaceKeywords.find((keywordObj) => {
      return keywordObj.keyword.split('|').some((pattern) => {
        return rangeMatch(
          pattern,
          reply,
          keywordObj.fuzzy,
          keywordObj.has_regular,
        );
      });
    });

    // 如果找到匹配的关键词对象，进行替换
    if (foundKeywordObj) {
      foundKeywordObj.keyword.split('|').forEach((pattern) => {
        // eslint-disable-next-line no-param-reassign
        reply = replaceKeyword(
          pattern,
          reply,
          foundKeywordObj.replace,
          foundKeywordObj.fuzzy,
          foundKeywordObj.has_regular,
        );
      });
    }

    return reply;
  }

  /**
   * 匹配关键词
   * @param ctx
   * @param message
   * @returns
   */
  public async matchTransferKeyword(
    ctx: Context,
    message: MessageDTO,
  ): Promise<boolean> {
    const appId = ctx.get(CTX_APP_ID);
    if (!appId) return false;

    const keywords = await this.autoReplyController.getTransferKeywords(appId);

    // 先找到匹配的关键词
    const foundKeywordObj = keywords.find((keywordObj) => {
      return keywordObj.keyword.split('|').some((pattern) => {
        return rangeMatch(
          pattern,
          message.content,
          keywordObj.fuzzy,
          keywordObj.has_regular,
        );
      });
    });

    if (foundKeywordObj) {
      return true;
    }

    return false;
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
        return rangeMatch(
          pattern,
          message.content,
          keywordObj.fuzzy,
          keywordObj.has_regular,
        );
      });
    });

    if (foundKeywordObj) {
      const chosenReply = await this.choseRandomReply(foundKeywordObj.reply);

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

  public async choseRandomReply(reply: string) {
    const replies = reply.split('[or]');
    const chosenReply = specialTokenReplace(
      replies[Math.floor(Math.random() * replies.length)],
    );

    return chosenReply;
  }

  /**
   * 检查 LLM 是否可用
   */
  public async checkGptHealth(cfg: LLMConfig) {
    try {
      const llmClient = this.createLLMClient(cfg, cfg.llmType);
      // 尝试使用它回复 Hi 来检查是否可用
      if ('chat' in llmClient) {
        // @ts-ignore
        const response = await llmClient.chat.completions.create({
          model: cfg.model,
          messages: [
            {
              role: 'user',
              content: 'Hi',
            },
          ],
          stream: true,
        });

        const chunks = [];
        // eslint-disable-next-line no-restricted-syntax
        for await (const chunk of response) {
          chunks.push(chunk.choices[0]?.delta?.content || '');
        }

        return {
          status: true,
          message: chunks.join(''),
        };
      }
    } catch (error) {
      console.error(`Error in getLLMResponse: ${error}`);
      return {
        status: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }

    return {
      status: false,
      message: '该模型的 LLM 不可用',
    };
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
      try {
        llmClient = this.createLLMClient(cfg, llm_name);
        this.llmClientMap.set(llm_name, llmClient);
      } catch (error) {
        console.error(`Error in getLLMResponse: ${error}`);
        return null;
      }
    }

    // 检查 llmClient 是否存在 completions 方法
    // const chatCompletion = await client.chat.completions.create
    if ('chat' in llmClient) {
      try {
        console.log('开始使用 GPT 生成回复....');
        console.log('messages:', messages);

        // @ts-ignore
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
    }

    return null;
  }

  /**
   * 创建 LLM 客户端
   * @param cfg
   * @param llmName
   * @returns
   */
  private createLLMClient(cfg: LLMConfig | Config, llmName: string) {
    let key;
    let baseUrl;

    console.log('Creating LLM client:', llmName, cfg);

    if ('baseUrl' in cfg) {
      key = cfg.key;
      baseUrl = cfg.baseUrl;
    } else {
      key = cfg.key;
      baseUrl = cfg.base_url;
    }

    const options = { apiKey: key, baseURL: baseUrl };
    if (!options.baseURL || !options.apiKey) {
      throw new Error('Missing required API key or base URL');
    }

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
    const msgs = f_messages.map((msg) => ({
      role: msg.role === 'SELF' ? 'assistant' : 'user',
      content: msg.content,
    }));

    return msgs;
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
