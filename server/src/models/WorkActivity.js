import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const WorkActivity = sequelize.define('WorkActivity', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  activityCode: DataTypes.STRING,
  activityName: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  constraints: DataTypes.TEXT,
  phase: DataTypes.STRING,
  plannedStartDate: DataTypes.DATEONLY,
  plannedEndDate: DataTypes.DATEONLY,
  actualStartDate: DataTypes.DATEONLY,
  actualEndDate: DataTypes.DATEONLY,
  reportDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  plannedProgress: { type: DataTypes.FLOAT, defaultValue: 0 },
  actualProgress: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('not_started', 'ongoing', 'delayed', 'completed', 'cancelled'), defaultValue: 'not_started' },
  responsiblePerson: DataTypes.STRING,
}, {
  timestamps: true,
});
