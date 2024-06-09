import { DataTypes, Model, Sequelize } from 'sequelize';

export class Plugin extends Model {
  declare id: number;

  declare name: string;

  declare code: string;

  declare platform: string;

  declare platform_id: string;

  declare instance_id: string; // 可能是作用于单个实例的插件

  declare created_at: Date;
}

export function initPlugin(sequelize: Sequelize) {
  Plugin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      code: {
        type: DataTypes.TEXT,
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Plugin',
      tableName: 'plugins',
      timestamps: false,
    },
  );
}
