import { DataTypes, Model, Sequelize } from 'sequelize';

export class Instance extends Model {
  declare id: number; // instance_id

  declare app_id: string;

  declare env_id: string;

  declare created_at: string;
}

export function initInstance(sequelize: Sequelize) {
  Instance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      app_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      env_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Instance',
      tableName: 'instance',
      timestamps: false,
    },
  );
}
