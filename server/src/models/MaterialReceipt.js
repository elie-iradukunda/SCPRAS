import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const MaterialReceipt = sequelize.define('MaterialReceipt', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  materialId: { type: DataTypes.INTEGER, allowNull: false },
  supplierId: DataTypes.INTEGER,
  receiptCode: DataTypes.STRING,
  itemCode: DataTypes.STRING,
  itemName: { type: DataTypes.STRING, allowNull: false },
  unit: DataTypes.STRING,
  quantityReceived: { type: DataTypes.FLOAT, allowNull: false },
  unitCost: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  deliveryNoteNo: DataTypes.STRING,
  receiptNo: DataTypes.STRING,
  receivedDate: DataTypes.DATEONLY,
  receivedBy: DataTypes.STRING,
  storageLocation: DataTypes.STRING,
  remarks: DataTypes.TEXT,
}, {
  timestamps: true,
});
