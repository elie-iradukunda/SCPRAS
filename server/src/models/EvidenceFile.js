import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const EvidenceFile = sequelize.define('EvidenceFile', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  relatedTable: DataTypes.STRING,
  relatedId: DataTypes.INTEGER,
  fileType: { type: DataTypes.ENUM('photo', 'receipt', 'delivery_note', 'inspection_report', 'drawing', 'other'), defaultValue: 'other' },
  fileUrl: DataTypes.STRING,
  uploadedBy: DataTypes.INTEGER,
  description: DataTypes.TEXT,
}, {
  timestamps: true,
});
