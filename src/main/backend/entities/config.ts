import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class Config extends Model {
  declare id: number;

  declare global: boolean;

  declare active: boolean;

  declare platform: string;

  declare platform_id: string;

  declare instance_id: string;

  declare use_plugin: boolean;

  declare plugin_id: number;

  declare extract_phone: boolean;

  declare extract_product: boolean;

  declare save_path: string;

  declare reply_speed: number;

  declare reply_random_speed: number;

  declare context_count: number;

  declare wait_humans_time: number;

  declare default_reply: string;

  declare base_url: string;

  declare key: string;

  declare llm_type: string;

  declare model: string;

  declare activation_code: string;

  declare version: string;

  declare has_paused: boolean;

  declare has_keyword_match: boolean;

  declare has_use_gpt: boolean;

  declare has_mouse_close: boolean; // 鼠标移动时是否自动关闭

  declare has_esc_close: boolean; // 按ESC键是否自动关闭

  declare truncate_word_count: number; // 截断词数

  declare truncate_word_key: string; // 截断词

  declare has_transfer: boolean; // 是否开启关键词转接给其它客服

  declare has_replace: boolean; // 是否开启关键词替换

  declare jinritemai_default_reply_match: string; // 抖店默认回复
}

export async function checkAndAddFields(sequelize: Sequelize) {
  const tableDescription = await Config.describe();

  // @ts-ignore
  if (!tableDescription.has_esc_close) {
    await sequelize.getQueryInterface().addColumn('n_config', 'has_esc_close', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    });
  }

  // @ts-ignore
  if (!tableDescription.truncate_word_count) {
    await sequelize
      .getQueryInterface()
      .addColumn('n_config', 'truncate_word_count', {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 4000,
      });
  }

  // @ts-ignore
  if (!tableDescription.truncate_word_key) {
    await sequelize
      .getQueryInterface()
      .addColumn('n_config', 'truncate_word_key', {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
      });
  }

  // @ts-ignore
  if (!tableDescription.has_transfer) {
    await sequelize.getQueryInterface().addColumn('n_config', 'has_transfer', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    });
  }

  // @ts-ignore
  if (!tableDescription.has_replace) {
    await sequelize.getQueryInterface().addColumn('n_config', 'has_replace', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    });
  }

  // @ts-ignore
  if (!tableDescription.jinritemai_default_reply_match) {
    await sequelize
      .getQueryInterface()
      .addColumn('n_config', 'jinritemai_default_reply_match', {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '很高兴为您服务，请问有什么可以帮您？',
      });
  }
}

export function initConfig(sequelize: Sequelize) {
  Config.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      global: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      platform: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      platform_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      instance_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      use_plugin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      plugin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      extract_phone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      extract_product: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      save_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reply_speed: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      reply_random_speed: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      default_reply: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '当前消息有点多，我稍后再回复你',
      },
      context_count: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      wait_humans_time: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      base_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      llm_type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'chatgpt',
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'gpt-3.5-turbo',
      },
      activation_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      version: {
        type: DataTypes.STRING(255),
        defaultValue: '1.0.0',
        allowNull: true,
      },
      has_paused: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      has_keyword_match: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      has_use_gpt: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      has_mouse_close: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      has_esc_close: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      truncate_word_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 4000,
      },
      truncate_word_key: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
      },
      has_transfer: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      has_replace: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      jinritemai_default_reply_match: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '很高兴为您服务，请问有什么可以帮您？',
      },
    },
    {
      sequelize,
      modelName: 'Config',
      tableName: 'n_config',
      timestamps: false,
    },
  );

  checkAndAddFields(sequelize);
}
