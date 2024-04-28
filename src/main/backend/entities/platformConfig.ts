import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class PlatformConfig extends Model {
  declare id: number;

  declare platform_id: string;

  declare openai_url: string;

  declare api_key: string;

  declare prompt: string;

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
      openai_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      api_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      prompt: {
        type: DataTypes.STRING(255),
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
      tableName: 'platform_config',
      timestamps: false,
    },
  );
}
