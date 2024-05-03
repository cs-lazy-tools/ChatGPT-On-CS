import ExcelJS from 'exceljs';
import fs from 'fs';
import { AutoReply } from '../entities/autoReply';
import { ALL_PLATFORMS } from '../constants';
import { getTempPath } from '../../utils';

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

    const platformMap = ALL_PLATFORMS.reduce((acc: any, platform) => {
      acc[platform.name] = platform;
      return acc;
    }, {});

    const autoReplies: any = [];

    // 从第三行开始读取数据（跳过标题）
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 2) {
        const keyword = row.getCell(1).text.trim();
        const reply = row.getCell(2).text.trim();
        const platform = row.getCell(3).text.trim();
        let platformId = '';

        if (platform && platformMap[platform]) {
          platformId = platformMap[platform].id;
        }

        autoReplies.push({
          keyword: String(keyword),
          reply: String(reply),
          platform_id: String(platformId),
          mode: 'fuzzy',
        });
      }
    });

    const originalAutoReplies = await AutoReply.findAll();

    try {
      // 先删除所有数据
      await AutoReply.destroy({ where: {} });
      await AutoReply.bulkCreate(autoReplies);
    } catch (error) {
      // 如果插入失败，回滚数据
      // @ts-ignore
      await AutoReply.bulkCreate(originalAutoReplies);
      throw error;
    }
  }

  async exportExcel() {
    const autoReplies = await AutoReply.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('自动回复');

    // 设置列宽
    worksheet.columns = [
      { key: 'keyword', width: 32 },
      { key: 'reply', width: 100 },
      { key: 'platform', width: 32 },
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
平台：哔哩哔哩、知乎、抖店、抖音、抖音企业号...（参考页面上的名字）`;
    titleCell.font = { bold: true };
    titleCell.alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true,
    };
    worksheet.getRow(1).height = 150;

    worksheet.addRow(['匹配关键词', '回复内容', '平台']);

    const platformMap = ALL_PLATFORMS.reduce((acc: any, platform) => {
      acc[platform.id] = platform;
      return acc;
    });

    // 添加数据行
    autoReplies.forEach((autoReply) => {
      // @ts-ignore
      const name = platformMap[autoReply.platform_id]
        ? // @ts-ignore
          platformMap[autoReply.platform_id].name
        : '';
      worksheet.addRow([autoReply.keyword, autoReply.reply, name]);
    });

    // 保存文件
    const filePath = `${getTempPath()}/excels/自动回复-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    return filePath;
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
