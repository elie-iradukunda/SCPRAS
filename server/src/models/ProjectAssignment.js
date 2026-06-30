import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ProjectAssignment = sequelize.define('ProjectAssignment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  workerId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'Site Team' },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['projectId', 'workerId'] }],
});
