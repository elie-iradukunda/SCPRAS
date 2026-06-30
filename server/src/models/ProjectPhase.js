import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ProjectPhase = sequelize.define('ProjectPhase', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  startDate: DataTypes.DATEONLY,
  endDate: DataTypes.DATEONLY,
  progress: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('planned', 'active', 'completed', 'delayed'), defaultValue: 'planned' },
  description: DataTypes.TEXT,
}, {
  timestamps: true,
});
