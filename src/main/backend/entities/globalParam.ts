import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class GlobalParam extends Model {
  declare id: number;

  declare key: string;

  declare value: string;
}

export function initGlobalParam(sequelize: Sequelize) {
  GlobalParam.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'GlobalParam',
      tableName: 'global_params',
      timestamps: false,
    },
  );
}
