import { DataTypes, Model, Sequelize } from 'sequelize';

// Extend the Model class with the attributes interface
export class Message extends Model {
  declare id: number;

  declare session_id: number;

  declare role: string;

  declare content: string;

  declare unique: string;

  declare msg_type: string;

  declare created_at: Date;
}

export function initMessage(sequelize: Sequelize) {
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      unique: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      msg_type: {
        type: DataTypes.STRING(55),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      timestamps: false,
    },
  );
}
