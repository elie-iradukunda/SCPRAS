import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ProjectDocument = sequelize.define('ProjectDocument', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  originalName: { type: DataTypes.STRING, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  mimeType: DataTypes.STRING,
  size: { type: DataTypes.INTEGER, defaultValue: 0 },
  category: { type: DataTypes.ENUM('blueprint', 'boq', 'permit', 'photo', 'other'), defaultValue: 'other' },
  url: { type: DataTypes.STRING, allowNull: false },
  drawingTitle: DataTypes.STRING,
  drawingType: { type: DataTypes.ENUM('architectural', 'structural', 'electrical', 'plumbing', 'mechanical', 'site_plan', 'other'), defaultValue: 'other' },
  drawingNumber: DataTypes.STRING,
  revisionNumber: DataTypes.STRING,
}, {
  timestamps: true,
});
