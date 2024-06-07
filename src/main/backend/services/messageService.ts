import fs from 'fs/promises';
import { DateTime } from 'luxon';
import socketIo from 'socket.io';
import { ConfigService } from './configService';
import { MessageController } from '../controllers/messageController';
import { AutoReplyController } from '../controllers/keywordReplyController';
import { MessageDTO, ReplyDTO, MessageType } from '../types';
import { Config } from '../entities/config';
import { Keyword } from '../entities/keyword';
import { TimeoutError, HumanTaskError } from '../errors/errors';
import PluginSystem from './pluginSystem';

export class MessageService {
  private isKeywordMatch: boolean;

  private isUseGptReply: boolean;

  private configService: ConfigService;

  private messageController: MessageController;

  private autoReplyController: AutoReplyController;

  private pluginSystem: PluginSystem;

  constructor(
    configService: ConfigService,
    messageController: MessageController,
    autoReplyController: AutoReplyController,
    pluginSystem: PluginSystem,
  ) {
    this.isKeywordMatch = true;
    this.isUseGptReply = true;
    this.configService = configService;
    this.messageController = messageController;
    this.autoReplyController = autoReplyController;
    this.pluginSystem = pluginSystem;
  }

  async getMessages(ctx: any, messages: MessageDTO[]) {
    const cfg = await this.configService.get(ctx);
    // 检查是否使用插件
    if (cfg.use_plugin && cfg.plugin_id) {
      return this.pluginSystem.executePlugin(cfg.plugin_id, ctx, messages);
    }

    
  }

  // // 提供一个方法用于注册事件处理器
  // public registerHandlers(socket: socketIo.Socket): void {
  //   socket.on('messageService-getMessages', async (data, callback) => {
  //     const { sess, msgs } = data;
  //     const session = {
  //       id: sess.id,
  //       username: sess.uname,
  //       platform_id: sess.pid,
  //       platform: sess.plat,
  //       last_active: sess.last,
  //     };

  //     const messages = msgs.map((msg: any) => ({
  //       session_id: msg.sid || session.id, // 处理默认值
  //       platform_id: msg.pid || session.platform_id,
  //       unique: msg.uniq,
  //       content: msg.cnt,
  //       role: msg.role,
  //       msg_type: msg.type || 'text', // 处理默认值
  //     }));

  //     let reply = { msg_type: 'text', content: '' };
  //     let config: Config;

  //     try {
  //       config = await this.configService.getConfigByPlatformId(
  //         session.platform_id,
  //       );
  //     } catch (error) {
  //       console.error(`Error in getMessages: ${error}`);

  //       config = await this.configService.getConfig();
  //       callback({ msg_type: 'text', content: config.default_reply });
  //       return;
  //     }

  //     try {
  //       // @ts-ignore
  //       reply = await this.getMessages(config, session, messages);
  //       callback(reply);
  //     } catch (error) {
  //       console.error(`Error in getMessages: ${error}`);
  //       reply = { msg_type: 'text', content: config.default_reply };
  //       callback(reply);
  //     } finally {
  //       messages.push({
  //         session_id: session.id,
  //         platform_id: session.platform_id,
  //         unique: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
  //         content: reply.content,
  //         role: 'assistant',
  //         msg_type: reply.msg_type,
  //       });

  //       await this.messageController.batchCreateMsgs(session.id, messages);
  //     }
  //   });

  //   socket.on('messageService-checkMessage', async (data, callback) => {
  //     const { unique, sessionId } = data;
  //     try {
  //       const exists = await this.checkMessage(unique, sessionId);
  //       callback(exists);
  //     } catch (error) {
  //       console.error(`Error in checkMessage: ${error}`);
  //       callback(false);
  //     }
  //   });
  // }

  // public async checkApiHealth(data: {
  //   baseUrl: string;
  //   apiKey: string;
  //   model: string;
  //   useDify: boolean;
  // }): Promise<{
  //   status: boolean;
  //   message: string;
  // }> {
  //   if (!data.baseUrl || !data.apiKey) {
  //     return {
  //       status: false,
  //       message: '请输入正确的服务地址和 API Key',
  //     };
  //   }

  //   if (data.useDify) {
  //     try {
  //       const reply = await this.difyRequest({
  //         gpt_base_url: data.baseUrl,
  //         gpt_key: data.apiKey,
  //         query: 'Hello',
  //       });

  //       console.warn('Dify API response:', reply);

  //       if (reply === '') {
  //         return {
  //           status: false,
  //           message: '请检查 Dify API Key 和服务地址是否正确',
  //         };
  //       }

  //       return {
  //         status: true,
  //         message: 'Dify API 正常',
  //       };
  //     } catch (error) {
  //       console.error(`Error in checkApiHealth: ${error}`);
  //       return {
  //         status: false,
  //         message:
  //           error instanceof Error ? error.message : JSON.stringify(error),
  //       };
  //     }
  //   }

  //   const client = new OpenAI({
  //     apiKey: data.apiKey,
  //     baseURL: data.baseUrl,
  //   });

  //   try {
  //     const response = await client.chat.completions.create({
  //       model: data.model,
  //       max_tokens: 100,
  //       messages: [
  //         {
  //           role: 'user',
  //           content: 'Tell me a message',
  //         },
  //       ],
  //       stream: false,
  //       temperature: 0.5,
  //       top_p: 1,
  //     });

  //     console.warn('OpenAI API response:', response);

  //     if (
  //       !response.choices ||
  //       !response.choices.length ||
  //       !response.choices[0].message ||
  //       !response.choices[0].message.content
  //     ) {
  //       return {
  //         status: false,
  //         message: '请检查 OpenAI API Key 和服务地址是否正确',
  //       };
  //     }

  //     return {
  //       status: true,
  //       message: 'OpenAI API 正常',
  //     };
  //   } catch (error) {
  //     console.error(`Error in checkApiHealth: ${error}`);
  //     return {
  //       status: false,
  //       message: error instanceof Error ? error.message : JSON.stringify(error),
  //     };
  //   }
  // }

  updateKeywordMatch(isKeywordMatch: boolean, isUseGptReply: boolean) {
    this.isKeywordMatch = isKeywordMatch;
    this.isUseGptReply = isUseGptReply;
  }

  // async getMessages(config: Config, session: Session, msgs: MessageDTO[]) {
  //   let messages = [...msgs];
  //   if (!messages.length) {
  //     throw new Error('messages cannot be empty');
  //   }

  //   // 再进行一次过滤，根据 config 中的 context_count
  //   if (config.context_count > 0) {
  //     messages = messages.slice(-config.context_count);
  //   }

  //   // 检查如果不存在用户的消息，则补上一条
  //   if (!messages.some((msg) => msg.role === 'user')) {
  //     // 从 msgs 中找到最后一条 user 的消息
  //     const lastUserMsg = messages
  //       .slice()
  //       .reverse()
  //       .find((msg) => msg.role === 'user');

  //     if (lastUserMsg) {
  //       messages.push(lastUserMsg);
  //     } else {
  //       return {
  //         msg_type: 'text',
  //         content: config.default_reply,
  //       };
  //     }
  //   }

  //   console.log('Starting to generate message content...');
  //   const lastMessage = messages[messages.length - 1];

  //   if (lastMessage.role === 'user') {
  //     await this.extractDataAsync(config, lastMessage);
  //   }

  //   try {
  //     const replyTask = this.getReplyTask(config, messages, session);
  //     const reply = await this.waitWithTimeout(
  //       replyTask,
  //       config.wait_humans_time * 1000,
  //     );

  //     reply.msg_type = this.getMsgType(reply);
  //     await new Promise((resolve) => {
  //       const min = config.reply_speed; // 5 seconds
  //       const max = config.reply_random_speed + config.reply_speed; // 10 seconds
  //       const randomTime = min + Math.random() * (max - min);
  //       setTimeout(resolve, randomTime * 1000);
  //     });

  //     return reply;
  //   } catch (error) {
  //     if (error instanceof TimeoutError) {
  //       throw new HumanTaskError('Reply timeout, please handle manually.');
  //     }
  //     console.error(`Error in getMessages: ${error}`);
  //     return {
  //       msg_type: 'text',
  //       content: config.default_reply,
  //     };
  //   }
  // }

  // private async waitWithTimeout(
  //   promise: Promise<ReplyDTO>,
  //   time: number,
  // ): Promise<ReplyDTO> {
  //   // Create a new promise that rejects after a timeout
  //   let timeoutHandle;
  //   const timeoutPromise = new Promise<ReplyDTO>((resolve, reject) => {
  //     timeoutHandle = setTimeout(() => {
  //       reject(new TimeoutError('Operation timed out'));
  //     }, time);
  //   });

  //   try {
  //     // Race the timeout against the original promise
  //     const result = await Promise.race([promise, timeoutPromise]);
  //     return result;
  //   } finally {
  //     // If the original promise or the timeout completes, we clear the timeout
  //     clearTimeout(timeoutHandle);
  //   }
  // }

  // private async getReplyTask(config: Config, messages: MessageDTO[]) {
  //   console.warn('getReplyTask', messages, session);

  //   // 提前定义好回复内容
  //   let replyContent = null;

  //   // 使用关键词匹配尝试回复
  //   if (this.isKeywordMatch) {
  //     console.log('Attempting to use keyword matching...');
  //     const { content, found } = await this.matchAndReply(
  //       messages,
  //       session.platform_id,
  //     );

  //     if (found && content) {
  //       console.log('Keyword match successful, using keyword to reply...');
  //       replyContent = content;
  //     }
  //   }

  //   if (!replyContent) {
  //     // 如果关键词匹配无效或未启用关键词匹配，调用 OpenAI 生成回复
  //     if (this.isUseGptReply) {
  //       console.log(
  //         'Keyword matching failed or not used, using OpenAI to generate reply...',
  //       );
  //       if (config.use_dify) {
  //         replyContent = await this.getDifyResponse(
  //           config,
  //           messages,
  //           session.platform_id,
  //         );
  //       } else {
  //         replyContent = await this.getOpenAIResponse(
  //           config,
  //           messages,
  //           session.platform_id,
  //         );
  //       }
  //     } else {
  //       replyContent = {
  //         content: config.default_reply,
  //         msg_type: 'text' as MessageType,
  //       };
  //     }
  //   }

  //   replyContent.msg_type = this.getMsgType(replyContent);
  //   return replyContent;
  // }

  // private async extractDataAsync(
  //   cfg: Config,
  //   message: MessageDTO,
  // ): Promise<void> {
  //   if (!cfg.extract_phone && !cfg.extract_product) return;
  //   if (cfg.save_path === '') return;

  //   console.log('开始提取用户消息中的数据....');
  //   const dataExtracted: { [key: string]: string } = {};
  //   const fileName = `${cfg.save_path}/${new Date().toISOString().split('T')[0]}.txt`;

  //   if (cfg.extract_phone) {
  //     const phoneNumbers = message.content.match(/\b1[3-9]\d{9}\b/g);
  //     if (phoneNumbers) dataExtracted.phone_numbers = phoneNumbers.join(', ');
  //   } else if (cfg.extract_product && message.msg_type === 'goods') {
  //     dataExtracted.products = message.content;
  //   }

  //   await fs.appendFile(
  //     fileName,
  //     `${Object.entries(dataExtracted)
  //       .map(([key, value]) => `${key}: ${value}`)
  //       .join('\n')}\n`,
  //   );
  // }

  // private async matchAndReply(
  //   messages: MessageDTO[],
  //   platformId: string,
  // ): Promise<{
  //   content: ReplyDTO;
  //   found: boolean;
  // }> {
  //   if (!messages.length) {
  //     return {
  //       content: { content: '', msg_type: 'text' },
  //       found: false,
  //     };
  //   }

  //   const lastMessage = messages[messages.length - 1].content;
  //   const keywords = await this.autoReplyController.getKeywords(platformId);

  //   const foundKeywordObj = keywords.find((keywordObj) => {
  //     return keywordObj.keyword.split('|').some((pattern) => {
  //       return this.simpleWildcardMatch(pattern, lastMessage);
  //     });
  //   });

  //   if (foundKeywordObj) {
  //     return {
  //       content: this.chooseReply(foundKeywordObj),
  //       found: true,
  //     };
  //   }

  //   return {
  //     content: { content: '', msg_type: 'text' },
  //     found: false,
  //   };
  // }

  // private chooseReply(keywordObj: AutoReply): ReplyDTO {
  //   const replies = keywordObj.reply.split('[or]');
  //   let chosenReply = this.replaceSpecialTokens(
  //     replies[Math.floor(Math.random() * replies.length)],
  //   );

  //   let msgType = 'text';
  //   if (chosenReply.includes('[@]') && chosenReply.includes('[/@]')) {
  //     msgType = 'file';
  //     const fileStart = chosenReply.indexOf('[@]') + 3;
  //     const fileEnd = chosenReply.indexOf('[/@]');
  //     const filePath = chosenReply.substring(fileStart, fileEnd);
  //     chosenReply = filePath;
  //   }

  //   // @ts-ignore
  //   return { content: chosenReply, msg_type: msgType };
  // }

  // private getMsgType(reply: ReplyDTO) {
  //   if (reply.msg_type === 'text') {
  //     return 'text';
  //   }

  //   const { content } = reply;
  //   if (
  //     content.endsWith('.jpg') ||
  //     content.endsWith('.png') ||
  //     content.endsWith('.gif') ||
  //     content.endsWith('.jpeg') ||
  //     content.endsWith('.webp')
  //   ) {
  //     return 'image';
  //   }
  //   if (
  //     content.endsWith('.mp4') ||
  //     content.endsWith('.mov') ||
  //     content.endsWith('.avi') ||
  //     content.endsWith('.flv')
  //   ) {
  //     return 'video';
  //   }
  //   return 'file';
  // }
}
