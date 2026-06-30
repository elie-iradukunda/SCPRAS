import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Worker = sequelize.define('Worker', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  employeeCode: { type: DataTypes.STRING, unique: true },
  position: { type: DataTypes.STRING, allowNull: false },
  salary: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  dailyRate: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  employmentType: { type: DataTypes.ENUM('permanent', 'contract', 'casual', 'subcontractor'), defaultValue: 'contract' },
  skillLevel: { type: DataTypes.ENUM('trainee', 'junior', 'skilled', 'foreman', 'supervisor'), defaultValue: 'skilled' },
  productivityScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  smartCardCode: { type: DataTypes.STRING, unique: true },
  joinDate: DataTypes.DATEONLY,
  dateOfBirth: DataTypes.DATEONLY,
  gender: { type: DataTypes.ENUM('male', 'female', 'other', 'not_specified'), defaultValue: 'not_specified' },
  department: DataTypes.STRING,
  address: DataTypes.STRING,
  emergencyContactName: DataTypes.STRING,
  emergencyContactPhone: DataTypes.STRING,
  emergencyContactRelationship: DataTypes.STRING,
  tradeCertification: DataTypes.STRING,
  safetyInductionDate: DataTypes.DATEONLY,
  medicalClearanceDate: DataTypes.DATEONLY,
  ppeIssued: { type: DataTypes.BOOLEAN, defaultValue: false },
  bankName: DataTypes.STRING,
  bankAccountNumber: DataTypes.STRING,
  notes: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('active', 'inactive', 'on_leave'), defaultValue: 'active' },
}, {
  timestamps: true,
});
