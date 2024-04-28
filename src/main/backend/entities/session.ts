import { DataTypes, Model, Sequelize } from 'sequelize';

export class Session extends Model {
  declare id: number;

  declare username: string;

  declare last_active: Date;

  declare platform: string;

  declare platform_id: string;

  declare goods_name: string;

  declare goods_avatar: string;

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
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      last_active: {
        type: DataTypes.DATE,
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
      goods_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      goods_avatar: {
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
      modelName: 'Session',
      tableName: 'sessions',
      timestamps: false,
    },
  );
}
