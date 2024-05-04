import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class Config extends Model {
  declare id: number;

  declare extract_phone: boolean;

  declare extract_product: boolean;

  declare save_path: string;

  declare reply_speed: number;

  declare reply_random_speed: number;

  declare context_count: number;

  declare wait_humans_time: number;

  declare default_reply: string;

  declare gpt_base_url: string;

  declare gpt_key: string;

  declare use_dify: boolean;

  declare gpt_model: string;

  declare gpt_temperature: number;

  declare gpt_top_p: number;

  declare stream: boolean;
}

export async function checkAndAddFields(sequelize: Sequelize) {
  const tableDescription = await Config.describe();

  // @ts-ignore
  if (!tableDescription.reply_random_speed) {
    await sequelize
      .getQueryInterface()
      .addColumn('Config', 'reply_random_speed', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
  }

  // @ts-ignore
  if (!tableDescription.context_count) {
    await sequelize.getQueryInterface().addColumn('Config', 'context_count', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  }

  // @ts-ignore
  if (!tableDescription.default_reply) {
    await sequelize.getQueryInterface().addColumn('Config', 'default_reply', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
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
      gpt_base_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gpt_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      use_dify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      gpt_model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gpt_temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      gpt_top_p: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      stream: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Config',
      tableName: 'config',
      timestamps: false,
    },
  );

  checkAndAddFields(sequelize);
}
