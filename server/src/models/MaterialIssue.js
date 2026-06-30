import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const MaterialIssue = sequelize.define('MaterialIssue', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  materialId: { type: DataTypes.INTEGER, allowNull: false },
  issueCode: DataTypes.STRING,
  issuedQuantity: { type: DataTypes.FLOAT, allowNull: false },
  issueDate: { type: DataTypes.DATEONLY, allowNull: false },
  issuedTo: DataTypes.STRING,
  issuedBy: DataTypes.STRING,
  usedFor: DataTypes.STRING,
  phase: DataTypes.STRING,
  siteLocation: DataTypes.STRING,
  approvalStatus: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  approvedBy: DataTypes.STRING,
  approvedAt: DataTypes.DATE,
  evidenceFile: DataTypes.STRING,
  remarks: DataTypes.TEXT,
  exceedsPlan: { type: DataTypes.BOOLEAN, defaultValue: false },
  exceedsStock: { type: DataTypes.BOOLEAN, defaultValue: false },
  plannedQuantityAtIssue: { type: DataTypes.FLOAT, defaultValue: 0 },
  usedQuantityBefore: { type: DataTypes.FLOAT, defaultValue: 0 },
  remainingStockBefore: { type: DataTypes.FLOAT, defaultValue: 0 },
  appliedToMaterial: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});
