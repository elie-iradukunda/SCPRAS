import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  supplierName: { type: DataTypes.STRING, allowNull: false },
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  address: DataTypes.STRING,
  supplierType: DataTypes.STRING,
  tinNumber: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, {
  timestamps: true,
});
