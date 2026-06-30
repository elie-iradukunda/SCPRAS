import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('qr', 'rfid', 'nfc', 'mobile'), defaultValue: 'qr' },
  location: DataTypes.STRING,
  status: { type: DataTypes.ENUM('online', 'offline', 'maintenance'), defaultValue: 'online' },
  lastSeen: DataTypes.DATE,
}, {
  timestamps: true,
});
