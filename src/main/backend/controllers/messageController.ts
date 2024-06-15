import fs from 'fs';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Message } from '../entities/message';
import { Session } from '../entities/session';
import { MessageDTO, ReplyDTO, Context } from '../types';
import { CTX_APP_ID, CTX_APP_NAME, CTX_INSTANCE_ID } from '../constants';
import { getTempPath } from '../../utils';

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

    // 先创建 Session
    const session = await Session.create({
      platform: appName,
      platform_id: appId,
      instance_id: instanceId,
      created_at: new Date(),
      context: Array.from(ctx.entries()),
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

  /**
   * 查询聊天会话
   * @param page 当前页
   * @param pageSize 每页大小
   * @returns
   */
  public async getSessions({
    page = 0,
    pageSize = 10,
    keyword,
    platformId,
  }: {
    page: number;
    pageSize: number;
    keyword?: string;
    platformId?: string;
  }) {
    // 如果存在关键词，需要去查询 Message 表，然后取得 session_id，再去查询 Session 表
    const kw = keyword?.trim();

    if (kw) {
      const messages = await Message.findAll({
        where: {
          content: {
            [Op.like]: `%${kw}%`,
          },
        },
      });

      const sessionIds = messages.map((msg) => msg.session_id);

      const where: any = {
        id: {
          [Op.in]: sessionIds,
        },
      };
      if (platformId) {
        where.platform_id = platformId;
      }

      return Session.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
    }

    const where: any = {};
    if (platformId) {
      where.platform_id = platformId;
    }

    return Session.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  }

  /**
   * 查询聊天消息
   * @param sessionId
   * @returns
   */
  public async getMessages(sessionId: number) {
    return Message.findAll({
      where: {
        session_id: sessionId,
      },
      order: [['created_at', 'ASC']],
    });
  }

  /**
   * 导出消息到 Excel
   *
   * @returns
   */
  public async exportExcel() {
    const msgs = await Message.findAll({
      order: [['created_at', 'ASC']],
    });

    const data = msgs.map((msg) => ({
      id: msg.id,
      session_id: msg.session_id,
      role: msg.role,
      content: msg.content,
      sender: msg.sender,
      type: msg.type,
      created_at: msg.created_at,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('全部消息');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Session ID', key: 'session_id', width: 10 },
      { header: '角色', key: 'role', width: 10 },
      { header: '内容', key: 'content', width: 50 },
      { header: '发送者', key: 'sender', width: 10 },
      { header: '类型', key: 'type', width: 10 },
      { header: '创建时间', key: 'created_at', width: 20 },
    ];

    worksheet.addRows(data);

    // 检查是否存在 excels 文件夹，不存在则创建
    if (!fs.existsSync(`${getTempPath()}/excels`)) {
      fs.mkdirSync(`${getTempPath()}/excels`);
    }

    // 保存文件
    const filePath = `${getTempPath()}/excels/全部消息-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
}
