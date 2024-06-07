import { Session } from '../entities/session';

export class SessionCreate {
  username: string;

  platform_id: string;

  platform: string;

  goods_name: string;

  goods_avatar: string;

  last_active: Date;

  created_at: Date;
}

export class SessionController {
  async createSession(
    platformId: string,
    platformName: string,
    username?: string,
    goodsName?: string,
    goodsAvatar?: string,
  ): Promise<Session> {
    return Session.create({
      platform_id: platformId,
      platform: platformName,
      username: username || '',
      last_active: new Date(),
      goods_name: goodsName || '',
      goods_avatar: goodsAvatar || '',
      created_at: new Date(),
    });
  }

  async update(id: number, sessionData: Session) {
    const session = await Session.findByPk(id);
    if (!session) {
      throw new Error('Session not found');
    }
    await session.update(sessionData);
    return session;
  }

  async search(platformId: string, username: string) {
    return Session.findAll({
      where: {
        platform_id: platformId,
        username,
      },
    });
  }

  async listMessagesWithSessions(data: {
    page: number;
    pageSize: number;
    keyword?: string;
    platformId?: string;
    startTime?: string;
    endTime?: string;
    orderBy: string;
  }): Promise<{
    total: number;
    msgs: any[];
  }> {
    const { page, pageSize, keyword, platformId, startTime, endTime, orderBy } =
      data;

    // 构建查询条件和参数
    const conditions: string[] = [];
    const parameters: any[] = [];

    if (keyword) {
      conditions.push(`messages.content LIKE '%' || ? || '%'`);
      parameters.push(keyword);
    }
    if (platformId) {
      conditions.push(`sessions.platform_id = ?`);
      parameters.push(platformId);
    }
    if (startTime) {
      conditions.push(`sessions.created_at >= ?`);
      parameters.push(startTime);
    }
    if (endTime) {
      conditions.push(`sessions.created_at <= ?`);
      parameters.push(endTime);
    }

    try {
      // 构建 WHERE 语句
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 查询 session IDs
      const sessionIdsQuery = `
    SELECT DISTINCT sessions.id
    FROM sessions
    JOIN messages ON sessions.id = messages.session_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

      const sessionIds = await Session.sequelize?.query(sessionIdsQuery, {
        replacements: [...parameters, pageSize, (page - 1) * pageSize],
        type: 'SELECT',
      });

      if (!sessionIds) {
        return { total: 0, msgs: [] };
      }

      // 查询消息
      const messagesQuery = `
    SELECT messages.*, sessions.*
    FROM messages
    JOIN sessions ON messages.session_id = sessions.id
    WHERE messages.session_id IN (${sessionIds.map((s: any) => s.id).join(',')})
    ORDER BY messages.created_at DESC
  `;

      const messages = await Session.sequelize?.query(messagesQuery, {
        type: 'SELECT',
      });

      // 查询总数
      const countQuery = `
    SELECT COUNT(DISTINCT sessions.id) AS total
    FROM sessions
    JOIN messages ON sessions.id = messages.session_id
    ${whereClause}
  `;

      const totalCount = await Session.sequelize?.query(countQuery, {
        replacements: parameters,
        type: 'SELECT',
      });

      return {
        // @ts-ignore
        total: totalCount[0].total,
        // @ts-ignore
        msgs: messages,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          'listMessagesWithSessions error:',
          error.message,
          error.stack,
        );
      }
      return { total: 0, msgs: [] };
    }
  }
}
