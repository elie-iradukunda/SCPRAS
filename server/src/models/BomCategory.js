import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const BomCategory = sequelize.define('BomCategory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  categoryName: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: DataTypes.TEXT,
}, {
  timestamps: true,
});
