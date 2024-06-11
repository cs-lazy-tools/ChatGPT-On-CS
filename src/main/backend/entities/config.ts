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
    },
    {
      sequelize,
      modelName: 'Config',
      tableName: 'n_config',
      timestamps: false,
    },
  );
}
