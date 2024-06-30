import ExcelJS from 'exceljs';
import fs from 'fs';
import { Op } from 'sequelize';
import axios from 'axios';
import { Keyword } from '../entities/keyword';
import { TransferKeyword } from '../entities/transfer';
import { ReplaceKeyword } from '../entities/replace';
import { getTempPath } from '../../utils';

export class KeywordReplyController {
  constructor(private port: number) {
    this.port = port;
  }

  async create(autoReplyData: any) {
    return Keyword.create(autoReplyData);
  }

  async update(id: number, autoReplyData: any) {
    const autoReply = await Keyword.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.update(autoReplyData);
  }

  async delete(id: number) {
    const autoReply = await Keyword.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.destroy();
  }

  async importExcel(path: string) {
    // 先校验文件是否存在，不存在则抛出异常
    if (!fs.existsSync(path)) {
      throw new Error('文件不存在');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path);
    const worksheet = workbook.worksheets[0];

    if (worksheet.rowCount === 0) {
      throw new Error('文件内容为空');
    }

    const data = await this.getApps();
    if (!data) {
      throw new Error('获取平台信息失败');
    }

    const ALL_PLATFORMS = data.data;
    const platformMap: Map<string, string> = ALL_PLATFORMS.reduce(
      (map, platform) => {
        map.set(platform.name, platform.id);
        return map;
      },
      new Map<string, string>(),
    );

    const autoReplies: any = [];

    // 从第三行开始读取数据（跳过标题）
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        const keyword = row.getCell(1).text.trim();
        const reply = row.getCell(2).text.trim();
        const platform = row.getCell(3).text.trim();
        const fuzzy = row.getCell(4).text.trim() === '是';
        const has_regular = row.getCell(5).text.trim() === '是';
        let platformId = '';

        if (platform && platformMap.has(platform)) {
          platformId = platformMap.get(platform) || '';
        }

        autoReplies.push({
          keyword: String(keyword),
          reply: String(reply),
          mode: 'fuzzy', // 废弃字段，这里只是兼容旧数据
          platform_id: String(platformId),
          fuzzy,
          has_regular,
        });
      }
    });

    const originalAutoReplies = await Keyword.findAll();

    try {
      // 先删除所有数据
      await Keyword.destroy({ where: {} });
      await Keyword.bulkCreate(autoReplies);
    } catch (error) {
      // 如果插入失败，回滚数据
      // @ts-ignore
      await Keyword.bulkCreate(originalAutoReplies);
      throw error;
    }
  }

  async exportExcel() {
    const data = await this.getApps();
    if (!data) {
      throw new Error('获取平台信息失败');
    }

    const ALL_PLATFORMS = data.data;
    const platformMap: Map<string, string> = ALL_PLATFORMS.reduce(
      (map, platform) => {
        map.set(platform.id, platform.name);
        return map;
      },
      new Map<string, string>(),
    );

    const autoReplies = await Keyword.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('自动回复');

    // 设置列宽
    worksheet.columns = [
      { key: 'keyword', width: 32 },
      { key: 'reply', width: 100 },
      { key: 'platform', width: 32 },
      { key: 'fuzzy', width: 10 },
      { key: 'has_regular', width: 10 },
    ];

    // 添加复杂的标题描述并设置换行和加粗
    worksheet.mergeCells('A1:C1'); // 合并第一行的三个单元格
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `匹配关键词：
    * 有时候我们希望能匹配多个关键词时，可以使用 “|” 分隔不同的关键词
    * 模糊匹配使用 “*” 符号，例如 “你好*”，那么只要用户输入的内容以 “你好” 开头就会回复你设置的回复内容.
    * 开始结束匹配符，可以使用 “啥时[and]发货” 这样表达，那么只要用户输入的内容以 “啥时” 开头，并且以 “发货” 结尾，就能匹配上你设置的关键词
回复内容：
    * 有时候我们希望能有多个随机回答，可以使用 “[or]” 来分隔不同的句子；
    * 使用 “[~]” 表示一个随机符，在拼多多平台等平台，是不允许每次重复一个回答的，所以可以插入一个随机符，以规避这个问题；
    * 可以使用 “[@]” 和 “[/@]” 包裹图片地址，如果支持图片发送的平台则可以直接发送这个文件

可使用的平台名称：${
      ALL_PLATFORMS.length > 0
        ? ALL_PLATFORMS.map((platform) => platform.name).join('、')
        : '暂无平台'
    }`;
    titleCell.font = { bold: true };
    titleCell.alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true,
    };
    worksheet.getRow(1).height = 150;

    worksheet.addRow([
      '匹配关键词',
      '回复内容',
      '平台',
      '模糊匹配',
      '支持正则',
    ]);

    // 添加数据行
    autoReplies.forEach((autoReply) => {
      const name = platformMap.get(autoReply.platform_id) || '';
      worksheet.addRow([
        autoReply.keyword,
        autoReply.reply,
        name,
        autoReply.fuzzy ? '是' : '否',
        autoReply.has_regular ? '是' : '否',
      ]);
    });

    // 检查是否存在 excels 文件夹，不存在则创建
    if (!fs.existsSync(`${getTempPath()}/excels`)) {
      fs.mkdirSync(`${getTempPath()}/excels`);
    }

    // 保存文件
    const filePath = `${getTempPath()}/excels/自动回复-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async getKeywords(platformId: string) {
    const autoReplies = await Keyword.findAll({
      where: {
        platform_id: platformId,
      },
    });

    const globalKeywords = await Keyword.findAll({
      where: {
        platform_id: {
          [Op.or]: [null, ''],
        },
      },
    });

    return [...globalKeywords, ...autoReplies];
  }

  async getReplaceKeywords(platformId: string) {
    const replaceKeywords = await ReplaceKeyword.findAll({
      where: {
        app_id: platformId,
      },
    });

    const globalKeywords = await ReplaceKeyword.findAll({
      where: {
        app_id: {
          [Op.or]: [null, ''],
        },
      },
    });

    return [...globalKeywords, ...replaceKeywords];
  }

  async getTransferKeywords(platformId: string) {
    const transferKeywords = await TransferKeyword.findAll({
      where: {
        app_id: platformId,
      },
    });

    const globalKeywords = await TransferKeyword.findAll({
      where: {
        app_id: {
          [Op.or]: [null, ''],
        },
      },
    });

    return [...globalKeywords, ...transferKeywords];
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
      const { rows: autoReplies, count: total } = await Keyword.findAndCountAll(
        {
          where: platformId
            ? {
                platform_id: platformId,
              }
            : {},
          offset: (page - 1) * pageSize,
          limit: pageSize,
        },
      );

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

  async listTransferKeywords({
    page,
    pageSize,
    appId,
  }: {
    page: number;
    pageSize: number;
    appId: string;
  }) {
    try {
      const { rows: transferKeywords, count: total } =
        await TransferKeyword.findAndCountAll({
          where: appId
            ? {
                app_id: appId,
              }
            : {},
          offset: (page - 1) * pageSize,
          limit: pageSize,
        });

      return {
        total,
        transferKeywords,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in AutoReplyController.list:', error.message);
        return {
          total: 0,
          transferKeywords: [],
        };
      }
      throw error;
    }
  }

  async createTransfer(autoReplyData: any) {
    return TransferKeyword.create(autoReplyData);
  }

  async updateTransfer(id: number, autoReplyData: any) {
    const autoReply = await TransferKeyword.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.update(autoReplyData);
  }

  async deleteTransfer(id: number) {
    const autoReply = await TransferKeyword.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.destroy();
  }

  async importTransferExcel(path: string) {
    // 先校验文件是否存在，不存在则抛出异常
    if (!fs.existsSync(path)) {
      throw new Error('文件不存在');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path);
    const worksheet = workbook.worksheets[0];

    if (worksheet.rowCount === 0) {
      throw new Error('文件内容为空');
    }

    const data = await this.getApps();
    if (!data) {
      throw new Error('获取平台信息失败');
    }

    const ALL_PLATFORMS = data.data;
    const platformMap: Map<string, string> = ALL_PLATFORMS.reduce(
      (map, platform) => {
        map.set(platform.name, platform.id);
        return map;
      },
      new Map<string, string>(),
    );

    const autoReplies: any = [];

    // 从第三行开始读取数据（跳过标题）
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        const keyword = row.getCell(1).text.trim();
        const fuzzy = row.getCell(2).text.trim() === '是';
        const has_regular = row.getCell(3).text.trim() === '是';
        const platform = row.getCell(4).text.trim();
        let platformId = '';

        if (platform && platformMap.has(platform)) {
          platformId = platformMap.get(platform) || '';
        }

        autoReplies.push({
          keyword: String(keyword),
          fuzzy,
          has_regular,
          app_id: String(platformId),
        });
      }
    });

    const originalAutoReplies = await TransferKeyword.findAll();

    try {
      // 先删除所有数据
      await TransferKeyword.destroy({ where: {} });
      await TransferKeyword.bulkCreate(autoReplies);
    } catch (error) {
      // 如果插入失败，回滚数据
      // @ts-ignore
      await TransferKeyword.bulkCreate(originalAutoReplies);
      throw error;
    }

    return autoReplies;
  }

  async exportTransferExcel() {
    const data = await this.getApps();
    if (!data) {
      throw new Error('获取平台信息失败');
    }

    const ALL_PLATFORMS = data.data;
    const platformMap: Map<string, string> = ALL_PLATFORMS.reduce(
      (map, platform) => {
        map.set(platform.id, platform.name);
        return map;
      },
      new Map<string, string>(),
    );

    const autoReplies = await TransferKeyword.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('转人工');

    // 设置列宽
    worksheet.columns = [
      { key: 'keyword', width: 32 },
      { key: 'fuzzy', width: 10 },
      { key: 'has_regular', width: 10 },
      { key: 'platform', width: 32 },
    ];

    // 添加复杂的标题描述并设置换行和加粗
    worksheet.mergeCells('A1:D1'); // 合并第一行的四个单元格
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `匹配关键词：
    * 有时候我们希望能匹配多个关键词时，可以使用 “|” 分隔不同的关键词
    * 模糊匹配使用 “*” 符号，例如 “你好*”，那么只要用户输入的内容以 “你好” 开头就会回复你设置的回复内容.
    * 开始结束匹配符，可以使用 “啥时[and]发货” 这样表达，那么只要用户输入的内容以 “啥时” 开头，并且以 “发货” 结尾，就能匹配上你设置的关键词
    * 是否支持正则匹配，如果支持正则匹配，那么可以使用正则表达式来匹配关键词
    * 是否支持模糊匹配，如果支持模糊匹配，那么可以使用 “*” 来匹配任意字符
    
    可使用的平台名称：${
      ALL_PLATFORMS.length > 0
        ? ALL_PLATFORMS.map((platform) => platform.name)
        : '暂无平台'
    }`;

    titleCell.font = { bold: true };
    titleCell.alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true,
    };

    worksheet.getRow(1).height = 150;

    worksheet.addRow(['匹配关键词', '模糊匹配', '支持正则', '平台']);

    // 添加数据行
    autoReplies.forEach((autoReply) => {
      const name = platformMap.get(autoReply.app_id) || '';
      worksheet.addRow([
        autoReply.keyword,
        autoReply.fuzzy ? '是' : '否',
        autoReply.has_regular ? '是' : '否',
        name,
      ]);
    });

    // 检查是否存在 excels 文件夹，不存在则创建
    if (!fs.existsSync(`${getTempPath()}/excels`)) {
      fs.mkdirSync(`${getTempPath()}/excels`);
    }

    // 保存文件
    const filePath = `${getTempPath()}/excels/转人工-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async listReplaceKeywords({
    page,
    pageSize,
    appId,
  }: {
    page: number;
    pageSize: number;
    appId: string;
  }) {
    try {
      const { rows: replaceKeywords, count: total } =
        await ReplaceKeyword.findAndCountAll({
          where: appId
            ? {
                app_id: appId,
              }
            : {},
          offset: (page - 1) * pageSize,
          limit: pageSize,
        });

      return {
        total,
        replaceKeywords,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in AutoReplyController.list:', error.message);
        return {
          total: 0,
          replaceKeywords: [],
        };
      }
      throw error;
    }
  }

  async createReplace(autoReplyData: any) {
    return ReplaceKeyword.create(autoReplyData);
  }

  async updateReplace(id: number, autoReplyData: any) {
    const autoReply = await ReplaceKeyword.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.update(autoReplyData);
  }

  async deleteReplace(id: number) {
    const autoReply = await ReplaceKeyword.findByPk(id);
    if (!autoReply) {
      throw new Error('AutoReply not found');
    }
    await autoReply.destroy();
  }

  async importReplaceExcel(path: string) {
    // 先校验文件是否存在，不存在则抛出异常
    if (!fs.existsSync(path)) {
      throw new Error('文件不存在');
    }

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(path);

    const worksheet = workbook.worksheets[0];

    if (worksheet.rowCount === 0) {
      throw new Error('文件内容为空');
    }

    const data = await this.getApps();
    if (!data) {
      throw new Error('获取平台信息失败');
    }

    const ALL_PLATFORMS = data.data;
    const platformMap: Map<string, string> = ALL_PLATFORMS.reduce(
      (map, platform) => {
        map.set(platform.name, platform.id);
        return map;
      },
      new Map<string, string>(),
    );

    const autoReplies: any = [];

    // 从第三行开始读取数据（跳过标题）
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        const keyword = row.getCell(1).text.trim();
        const replace = row.getCell(2).text.trim();
        const fuzzy = row.getCell(3).text.trim() === '是';
        const has_regular = row.getCell(4).text.trim() === '是';
        const platform = row.getCell(5).text.trim();
        let platformId = '';

        if (platform && platformMap.has(platform)) {
          platformId = platformMap.get(platform) || '';
        }

        autoReplies.push({
          keyword: String(keyword),
          replace: String(replace),
          fuzzy,
          has_regular,
          app_id: String(platformId),
        });
      }
    });

    const originalAutoReplies = await ReplaceKeyword.findAll();

    try {
      // 先删除所有数据
      await ReplaceKeyword.destroy({ where: {} });
      await ReplaceKeyword.bulkCreate(autoReplies);
    } catch (error) {
      // 如果插入失败，回滚数据
      // @ts-ignore
      await ReplaceKeyword.bulkCreate(originalAutoReplies);
      throw error;
    }
  }

  async exportReplaceExcel() {
    const data = await this.getApps();
    if (!data) {
      throw new Error('获取平台信息失败');
    }

    const ALL_PLATFORMS = data.data;
    const platformMap: Map<string, string> = ALL_PLATFORMS.reduce(
      (map, platform) => {
        map.set(platform.id, platform.name);
        return map;
      },
      new Map<string, string>(),
    );

    const autoReplies = await ReplaceKeyword.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('关键词替换');

    // 设置列宽
    worksheet.columns = [
      { key: 'keyword', width: 32 },
      { key: 'replace', width: 100 },
      { key: 'fuzzy', width: 10 },
      { key: 'has_regular', width: 10 },
      { key: 'platform', width: 32 },
    ];

    // 添加复杂的标题描述并设置换行和加粗
    worksheet.mergeCells('A1:E1'); // 合并第一行的五个单元格
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `匹配关键词：
    * 有时候我们希望能匹配多个关键词时，可以使用 “|” 分隔不同的关键词
    * 模糊匹配使用 “*” 符号，例如 “你好*”，那么只要用户输入的内容以 “你好” 开头就会回复你设置的回复内容.
    * 开始结束匹配符，可以使用 “啥时[and]发货” 这样表达，那么只要用户输入的内容以 “啥时” 开头，并且以 “发货” 结尾，就能匹配上你设置的关键词
    * 是否支持正则匹配，如果支持正则匹配，那么可以使用正则表达式来匹配关键词
    * 是否支持模糊匹配，如果支持模糊匹配，那么可以使用 “*”
  
    可使用的平台名称：${
      ALL_PLATFORMS.length > 0
        ? ALL_PLATFORMS.map((platform) => platform.name)
        : '暂无平台'
    }`;

    titleCell.font = { bold: true };

    titleCell.alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true,
    };

    worksheet.getRow(1).height = 150;

    worksheet.addRow([
      '匹配关键词',
      '替换内容',
      '模糊匹配',
      '支持正则',
      '平台',
    ]);

    // 添加数据行
    autoReplies.forEach((autoReply) => {
      const name = platformMap.get(autoReply.app_id) || '';
      worksheet.addRow([
        autoReply.keyword,
        autoReply.replace,
        autoReply.fuzzy,
        autoReply.has_regular,
        name,
      ]);
    });

    // 检查是否存在 excels 文件夹，不存在则创建
    if (!fs.existsSync(`${getTempPath()}/excels`)) {
      fs.mkdirSync(`${getTempPath()}/excels`);
    }

    // 保存文件
    const filePath = `${getTempPath()}/excels/关键词替换-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * FIXME: 为了避免依赖注入，这里直接通过网络请求获取所有平台，后续优化
   * @returns 所有平台
   */
  async getApps() {
    const { data } = await axios.get<{
      data: {
        id: string;
        name: string;
      }[];
    }>(`http://127.0.0.1:${this.port}/api/v1/base/platform/all`);
    return data;
  }
}
