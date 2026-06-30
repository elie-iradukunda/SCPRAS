import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  workerId: { type: DataTypes.INTEGER, allowNull: false },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  checkIn: { type: DataTypes.DATE, allowNull: false },
  checkOut: DataTypes.DATE,
  hoursWorked: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'on_leave', 'half_day'), defaultValue: 'present' },
  notes: DataTypes.TEXT,
  location: DataTypes.STRING,
}, {
  timestamps: true,
});
