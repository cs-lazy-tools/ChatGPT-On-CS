import fs from 'fs/promises';
import { DateTime } from 'luxon';
import OpenAI from 'openai';
import socketIo from 'socket.io';
import axios from 'axios';
import { ConfigController } from '../controllers/configController';
import { MessageController } from '../controllers/messageController';
import { AutoReplyController } from '../controllers/autoReplyController';
import { MessageDTO, ReplyDTO } from '../types';
import { Session } from '../entities/session';
import { Config } from '../entities/config';
import { AutoReply } from '../entities/autoReply';
import { TimeoutError, HumanTaskError } from '../errors/errors';

const errorMessages = '抱歉，消息有点多，我稍后再回复您。';

export class MessageService {
  private isKeywordMatch: boolean;

  private baseUrl: string;

  private apiKey: string;

  private openaiClient: OpenAI;

  private configController: ConfigController;

  private messageController: MessageController;

  private autoReplyController: AutoReplyController;

  constructor(
    configController: ConfigController,
    messageController: MessageController,
    autoReplyController: AutoReplyController,
  ) {
    this.isKeywordMatch = true;
    this.baseUrl = '';
    this.apiKey = '';
    this.configController = configController;
    this.messageController = messageController;
    this.autoReplyController = autoReplyController;
  }

  // 提供一个方法用于注册事件处理器
  public registerHandlers(socket: socketIo.Socket): void {
    socket.on('messageService-getMessages', async (data, callback) => {
      const { sess, msgs } = data;
      try {
        const session = {
          id: sess.id,
          username: sess.uname,
          platform_id: sess.pid,
          platform: sess.plat,
          last_active: sess.last,
        };

        const messages = msgs.map((msg: any) => ({
          session_id: msg.sid || session.id, // 处理默认值
          platform_id: msg.pid || session.platform_id,
          unique: msg.uniq,
          content: msg.cnt,
          role: msg.role,
          msg_type: msg.type || 'text', // 处理默认值
        }));

        // @ts-ignore
        const reply = await this.getMessages(session, messages);
        callback({
          msg_type: reply.msg_type,
          content: reply.content,
        });
      } catch (error) {
        console.error(`Error in getMessages: ${error}`);
        callback({ msg_type: 'text', content: errorMessages });
      }
    });

    socket.on('messageService-checkMessage', async (data, callback) => {
      const { unique, sessionId } = data;
      try {
        const exists = await this.checkMessage(unique, sessionId);
        callback(exists);
      } catch (error) {
        console.error(`Error in checkMessage: ${error}`);
        callback(false);
      }
    });
  }

  public async checkApiHealth(data: {
    baseUrl: string;
    apiKey: string;
    model: string;
    useDify: boolean;
  }): Promise<{
    status: boolean;
    message: string;
  }> {
    if (!data.baseUrl || !data.apiKey) {
      return {
        status: false,
        message: '请输入正确的服务地址和 API Key',
      };
    }

    if (data.useDify) {
      try {
        const reply = await this.difyRequest({
          gpt_base_url: data.baseUrl,
          gpt_key: data.apiKey,
          query: 'Hello',
        });

        if (reply === '') {
          return {
            status: false,
            message: '请检查 Dify API Key 和服务地址是否正确',
          };
        }

        return {
          status: true,
          message: 'Dify API 正常',
        };
      } catch (error) {
        console.error(`Error in checkApiHealth: ${error}`);
        return {
          status: false,
          message:
            error instanceof Error ? error.message : JSON.stringify(error),
        };
      }
    }

    const client = new OpenAI({
      apiKey: data.apiKey,
      baseURL: data.baseUrl,
    });

    try {
      const response = await client.chat.completions.create({
        model: data.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Tell me a message',
          },
        ],
        stream: false,
        temperature: 0.5,
        top_p: 1,
      });

      if (
        !response.choices ||
        !response.choices.length ||
        !response.choices[0].message ||
        !response.choices[0].message.content
      ) {
        return {
          status: false,
          message: '请检查 OpenAI API Key 和服务地址是否正确',
        };
      }

      return {
        status: true,
        message: 'OpenAI API 正常',
      };
    } catch (error) {
      console.error(`Error in checkApiHealth: ${error}`);
      return {
        status: false,
        message: error instanceof Error ? error.message : JSON.stringify(error),
      };
    }
  }

  async checkMessage(unique: string, sessionId: number) {
    try {
      const exists = await this.messageController.checkExists(
        unique,
        sessionId,
      );
      return exists;
    } catch (e) {
      console.error(`Error in checkMessage: ${e}`);
      return false;
    }
  }

  updateKeywordMatch(isKeywordMatch: boolean) {
    this.isKeywordMatch = isKeywordMatch;
  }

  async getMessages(session: Session, messages: MessageDTO[]) {
    if (!messages.length) {
      throw new Error('messages cannot be empty');
    }

    console.log('Starting to generate message content...');
    const config = await this.configController.getConfig();
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === 'user') {
      await this.extractDataAsync(config, lastMessage);
    }

    try {
      const replyTask = this.getReplyTask(config, messages, session);
      const reply = await this.waitWithTimeout(
        replyTask,
        config.wait_humans_time * 1000,
      );

      reply.msg_type = this.getMsgType(reply);
      await new Promise((resolve) =>
        setTimeout(resolve, config.reply_speed * 1000),
      );
      messages.push({
        session_id: session.id,
        platform_id: session.platform_id,
        unique: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        content: reply.content,
        role: 'assistant',
        msg_type: reply.msg_type,
      });
      return reply;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HumanTaskError('Reply timeout, please handle manually.');
      }
      console.error(`Error in getMessages: ${error}`);
      return {
        msg_type: 'text',
        content: errorMessages,
      };
    } finally {
      await this.messageController.batchCreateMsgs(session.id, messages);
    }
  }

  private async waitWithTimeout(
    promise: Promise<ReplyDTO>,
    time: number,
  ): Promise<ReplyDTO> {
    // Create a new promise that rejects after a timeout
    let timeoutHandle;
    const timeoutPromise = new Promise<ReplyDTO>((resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new TimeoutError('Operation timed out'));
      }, time);
    });

    try {
      // Race the timeout against the original promise
      const result = await Promise.race([promise, timeoutPromise]);
      return result;
    } finally {
      // If the original promise or the timeout completes, we clear the timeout
      clearTimeout(timeoutHandle);
    }
  }

  private async getReplyTask(
    config: Config,
    messages: MessageDTO[],
    session: Session,
  ) {
    // 提前定义好回复内容
    let replyContent = null;

    // 使用关键词匹配尝试回复
    if (this.isKeywordMatch) {
      console.log('Attempting to use keyword matching...');
      const { content, found } = await this.matchAndReply(
        messages,
        session.platform_id,
      );

      if (found && content) {
        console.log('Keyword match successful, using keyword to reply...');
        replyContent = content;
      }
    }

    // 如果关键词匹配无效或未启用关键词匹配，调用 OpenAI 生成回复
    if (!replyContent) {
      console.log(
        'Keyword matching failed or not used, using OpenAI to generate reply...',
      );
      if (config.use_dify) {
        replyContent = await this.getDifyResponse(
          config,
          messages,
          session.platform_id,
        );
      } else {
        replyContent = await this.getOpenAIResponse(
          config,
          messages,
          session.platform_id,
        );
      }
    }

    replyContent.msg_type = this.getMsgType(replyContent);
    return replyContent;
  }

  private async getOpenAIResponse(
    cfg: Config,
    messages: MessageDTO[],
    prompt: string = 'Tell me a message',
    maxTokens: number = 100,
  ): Promise<ReplyDTO> {
    if (
      !this.openaiClient ||
      this.baseUrl !== cfg.gpt_base_url ||
      this.apiKey !== cfg.gpt_key
    ) {
      this.openaiClient = new OpenAI({
        apiKey: cfg.gpt_key,
        baseURL: cfg.gpt_base_url,
      });
    }

    const targets = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    if (prompt !== '') {
      targets.push({ role: 'system', content: prompt });
    }

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: cfg.gpt_model,
        max_tokens: maxTokens,
        messages: targets,
        stream: false,
        temperature: cfg.gpt_temperature,
        top_p: cfg.gpt_top_p,
      });

      if (
        !response.choices ||
        !response.choices.length ||
        !response.choices[0].message ||
        !response.choices[0].message.content
      ) {
        console.error('Error in getOpenAIResponse: response is empty');

        return {
          msg_type: 'text',
          content: errorMessages,
        };
      }

      const message = response.choices[0].message.content.trim();
      return { msg_type: 'text', content: message };
    } catch (error) {
      console.error(`Error in getOpenAIResponse: ${error}`);
      return {
        msg_type: 'text',
        content: errorMessages,
      };
    }
  }

  private async extractDataAsync(
    cfg: Config,
    message: MessageDTO,
  ): Promise<void> {
    if (!cfg.extract_phone && !cfg.extract_product) return;
    if (cfg.save_path === '') return;

    console.log('开始提取用户消息中的数据....');
    const dataExtracted: { [key: string]: string } = {};
    const fileName = `${cfg.save_path}/${new Date().toISOString().split('T')[0]}.txt`;

    if (cfg.extract_phone) {
      const phoneNumbers = message.content.match(/\b1[3-9]\d{9}\b/g);
      if (phoneNumbers) dataExtracted.phone_numbers = phoneNumbers.join(', ');
    } else if (cfg.extract_product && message.msg_type === 'goods') {
      dataExtracted.products = message.content;
    }

    await fs.appendFile(
      fileName,
      `${Object.entries(dataExtracted)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}\n`,
    );
  }

  private async matchAndReply(
    messages: MessageDTO[],
    platformId: string,
  ): Promise<{
    content: ReplyDTO;
    found: boolean;
  }> {
    if (!messages.length) {
      return {
        content: { content: '', msg_type: 'text' },
        found: false,
      };
    }

    const lastMessage = messages[messages.length - 1].content;
    const keywords = await this.autoReplyController.getKeywords(platformId);

    const foundKeywordObj = keywords.find((keywordObj) => {
      return keywordObj.keyword.split('|').some((pattern) => {
        return this.simpleWildcardMatch(pattern, lastMessage);
      });
    });

    if (foundKeywordObj) {
      return {
        content: this.chooseReply(foundKeywordObj),
        found: true,
      };
    }
    return {
      content: { content: '', msg_type: 'text' },
      found: false,
    };
  }

  private simpleWildcardMatch(pattern: string, msg: string) {
    if (pattern.includes('[and]')) {
      const keywords = pattern.split('[and]');
      return keywords.every((keyword) =>
        this.matchKeyword(keyword.trim(), msg),
      );
    }
    return this.matchKeyword(pattern, msg);
  }

  private matchKeyword(pattern: string, msg: string) {
    if (!pattern.includes('*')) {
      return pattern === msg;
    }

    const parts = pattern.split('*');
    let lastIndex = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const part of parts) {
      // eslint-disable-next-line no-continue
      if (part === '') continue;
      const index = msg.indexOf(part, lastIndex);
      if (index === -1 || index < lastIndex) return false;
      lastIndex = index + part.length;
    }
    return true;
  }

  private replaceSpecialTokens(replyMsg: string) {
    let reply = replyMsg;
    const randomChoices = [
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '🌸',
      '😊',
      '🌷',
      '🌹',
      '💖',
      '🪷',
      '💐',
      '🌺',
      '🌼',
      '🌻',
    ];
    while (reply.includes('[~]')) {
      const randomChoice =
        randomChoices[Math.floor(Math.random() * randomChoices.length)];
      reply = reply.replace('[~]', randomChoice);
    }
    return reply;
  }

  private chooseReply(keywordObj: AutoReply): ReplyDTO {
    const replies = keywordObj.reply.split('[or]');
    let chosenReply = this.replaceSpecialTokens(
      replies[Math.floor(Math.random() * replies.length)],
    );

    let msgType = 'text';
    if (chosenReply.includes('[@]') && chosenReply.includes('[/@]')) {
      msgType = 'file';
      const fileStart = chosenReply.indexOf('[@]') + 3;
      const fileEnd = chosenReply.indexOf('[/@]');
      const filePath = chosenReply.substring(fileStart, fileEnd);
      chosenReply = filePath;
    }

    // @ts-ignore
    return { content: chosenReply, msg_type: msgType };
  }

  private getMsgType(reply: ReplyDTO) {
    if (reply.msg_type === 'text') {
      return 'text';
    }

    const { content } = reply;
    if (
      content.endsWith('.jpg') ||
      content.endsWith('.png') ||
      content.endsWith('.gif') ||
      content.endsWith('.jpeg') ||
      content.endsWith('.webp')
    ) {
      return 'image';
    }
    if (
      content.endsWith('.mp4') ||
      content.endsWith('.mov') ||
      content.endsWith('.avi') ||
      content.endsWith('.flv')
    ) {
      return 'video';
    }
    return 'file';
  }

  // https://docs.dify.ai/v/zh-hans/guides/application-publishing/developing-with-apis
  // https://github.com/fatwang2/dify2openai
  private async getDifyResponse(
    cfg: {
      gpt_base_url: string;
      gpt_key: string;
    },
    messages: MessageDTO[],
    prompt: string = 'Tell me a message',
  ): Promise<ReplyDTO> {
    const targets = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    if (prompt !== '') {
      targets.push({ role: 'system', content: prompt });
    }

    const lastMessage = messages[messages.length - 1];
    const queryString = `here is our talk history:\n'''\n${messages
      .slice(0, -1)
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n')}\n'''\n\nhere is my question:\n${lastMessage.content}`;

    const answer = await this.difyRequest({
      query: queryString,
      gpt_base_url: cfg.gpt_base_url,
      gpt_key: cfg.gpt_key,
    });

    if (answer === '') {
      return {
        msg_type: 'text',
        content: errorMessages,
      };
    }

    return {
      msg_type: 'text',
      content: answer,
    };
  }

  private async difyRequest(data: {
    query: string;
    gpt_base_url: string;
    gpt_key: string;
  }) {
    const resp = await axios.post(
      `${data.gpt_base_url}/chat-messages`,
      {
        inputs: {},
        query: data.query,
        response_mode: 'blocking',
        user: 'apiuser',
        auto_generate_name: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.gpt_key}`,
        },
      },
    );

    const { answer } = resp.data;
    return answer;
  }
}
