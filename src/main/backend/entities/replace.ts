import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class ReplaceKeyword extends Model {
  declare id: number; // Note that the `null assertion` `!` is required in strict mode.

  declare keyword: string;

  declare app_id: string;

  declare replace: string;

  declare fuzzy: boolean;

  declare has_regular: boolean;
}

export function initReplace(sequelize: Sequelize) {
  ReplaceKeyword.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      keyword: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      replace: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      has_regular: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      app_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      fuzzy: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Replace',
      tableName: 'replace',
      timestamps: false,
    },
  );
}
