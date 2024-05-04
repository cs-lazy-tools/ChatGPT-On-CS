import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class PlatformConfig extends Model {
  declare id: number;

  declare platform_id: string;

  declare settings: any;

  declare active: boolean;
}

export function initPlatformConfig(sequelize: Sequelize) {
  PlatformConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      platform_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'PlatformConfig',
      tableName: 'platform_cfg', // 创建一个新的表，用于存储 JSON 格式的配置
      timestamps: false,
    },
  );
}
