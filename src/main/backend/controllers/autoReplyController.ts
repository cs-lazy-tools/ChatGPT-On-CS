import { AutoReply } from '../entities/autoReply';

export class AutoReplyController {
  async create(autoReplyData: any) {
    return AutoReply.create(autoReplyData);
  }

  async update(id: number, autoReplyData: any) {
    const autoReply = await AutoReply.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.update(autoReplyData);
  }

  async delete(id: number) {
    const autoReply = await AutoReply.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.destroy();
  }

  async getKeywords(platformId: string) {
    const autoReplies = await AutoReply.findAll({
      where: {
        platform_id: platformId,
      },
    });

    const globalKeywords = await AutoReply.findAll({
      where: {
        platform_id: '',
      },
    });

    return [...globalKeywords, ...autoReplies];
  }

  async list({
    page,
    pageSize,
    platformId,
  }: {
    page: number;
    pageSize: number;
    platformId: string;
  }) {
    try {
      const { rows: autoReplies, count: total } =
        await AutoReply.findAndCountAll({
          where: platformId
            ? {
                platform_id: platformId,
              }
            : {},
          offset: (page - 1) * pageSize,
          limit: pageSize,
        });

      return {
        total,
        autoReplies,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in AutoReplyController.list:', error.message);
        return {
          total: 0,
          autoReplies: [],
        };
      }
      throw error;
    }
  }
}
