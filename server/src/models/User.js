import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'project_manager', 'site_engineer', 'quantity_surveyor', 'store_officer', 'contractor_foreman'), allowNull: false },
  phone: DataTypes.STRING,
  nationalId: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'inactive', 'suspended'), defaultValue: 'active' },
}, {
  timestamps: true,
});
