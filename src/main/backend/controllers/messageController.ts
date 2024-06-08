import { Message } from '../entities/message';
import { Session } from '../entities/session';
import { MessageDTO, ReplyDTO, Context } from '../types';
import { CTX_APP_ID, CTX_APP_NAME, CTX_INSTANCE_ID } from '../constants';

export class MessageController {
  /**
   * 保存消息
   * @param ctx
   * @param reply
   * @param messages
   */
  public async saveMessages(
    ctx: Context,
    reply: ReplyDTO,
    messages: MessageDTO[],
  ) {
    const appId = ctx.get(CTX_APP_ID);
    const instanceId = ctx.get(CTX_INSTANCE_ID);
    const appName = ctx.get(CTX_APP_NAME);

    if (!appId || !instanceId) {
      throw new Error('Invalid context');
    }

    // 把 context 转成 JSON 字符串
    const ctxStr = JSON.stringify(ctx);

    // 先创建 Session
    const session = await Session.create({
      platform: appName,
      platform_id: appId,
      instance_id: instanceId,
      created_at: new Date(),
      context: ctxStr,
    });

    // 再创建 Message
    const msgs = messages.map((msg) => {
      return {
        session_id: session.id,
        role: msg.role,
        content: msg.content,
        sender: msg.sender,
        type: msg.type,
        created_at: new Date(),
      };
    });

    msgs.push({
      session_id: session.id,
      role: 'SELF',
      content: reply.content,
      type: reply.type,
      sender: 'BOT',
      created_at: new Date(),
    });

    await Message.bulkCreate(msgs);
  }
}
