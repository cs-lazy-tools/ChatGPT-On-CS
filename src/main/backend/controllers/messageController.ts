import { Message } from '../entities/message';
import { MessageDTO } from '../types';

export class MessageController {
  async create(messageData: Message) {
    // @ts-ignore
    const data = await Message.create(messageData);
    return data;
  }

  async update(id: number, messageData: Message) {
    const message = await Message.findByPk(id);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.update(messageData);
  }

  async delete(id: number) {
    const message = await Message.findByPk(id);
    if (!message) {
      throw new Error('Message not found');
    }
    await message.destroy();
  }

  async list({
    page,
    pageSize,
    sessionId,
  }: {
    page: number;
    pageSize: number;
    sessionId: number;
  }) {
    const { rows: messages, count: total } = await Message.findAndCountAll({
      where: {
        session_id: sessionId,
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return {
      total,
      messages,
    };
  }

  async checkExists(unique: string, sessionId: number) {
    const message = await Message.findOne({
      where: { session_id: sessionId, unique },
    });
    return !!message;
  }

  async batchCreateMsgs(sessionId: number, msgs: Message[] | MessageDTO[]) {
    const messages = msgs.map((msg) => {
      return {
        ...msg,
        session_id: sessionId,
      };
    });
    const data = await Message.bulkCreate(messages);
    return data;
  }
}
