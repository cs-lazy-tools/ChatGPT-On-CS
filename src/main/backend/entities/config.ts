import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class Config extends Model {
  declare id: number; // Note that the `null assertion` `!` is required in strict mode.

  declare extract_phone: boolean;

  declare extract_product: boolean;

  declare save_path: string;

  declare reply_speed: number;

  declare merged_message_num: number;

  declare wait_humans_time: number;

  declare gpt_base_url: string;

  declare gpt_key: string;

  declare use_dify: boolean;

  declare gpt_model: string;

  declare gpt_temperature: number;

  declare gpt_top_p: number;

  declare stream: boolean;

  declare use_lazy: boolean;

  declare lazy_key: string;
}

export function initConfig(sequelize: Sequelize) {
  Config.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      extract_phone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      extract_product: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      save_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reply_speed: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      merged_message_num: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      wait_humans_time: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      gpt_base_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gpt_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      use_dify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      gpt_model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gpt_temperature: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      gpt_top_p: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      stream: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      use_lazy: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      lazy_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Config',
      tableName: 'config',
      timestamps: false,
    },
  );
}
