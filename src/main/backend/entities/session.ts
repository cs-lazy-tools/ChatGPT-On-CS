import { DataTypes, Model, Sequelize } from 'sequelize';

export class Session extends Model {
  declare id: number;

  declare platform: string;

  declare platform_id: string;

  declare instance_id: string; // 可能是作用于单个实例的插件

  declare context: string;

  declare created_at: Date;
}

export function initSession(sequelize: Sequelize) {
  Session.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      platform: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      platform_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      context: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Session',
      tableName: 'n_sessions',
      timestamps: false,
    },
  );
}
