import { Attendance } from './Attendance.js';
import { BomCategory } from './BomCategory.js';
import { Device } from './Device.js';
import { EvidenceFile } from './EvidenceFile.js';
import { Material } from './Material.js';
import { MaterialIssue } from './MaterialIssue.js';
import { MaterialReceipt } from './MaterialReceipt.js';
import { Project } from './Project.js';
import { ProjectAssignment } from './ProjectAssignment.js';
import { ProjectDocument } from './ProjectDocument.js';
import { ProjectPhase } from './ProjectPhase.js';
import { Supplier } from './Supplier.js';
import { User } from './User.js';
import { WorkActivity } from './WorkActivity.js';
import { Worker } from './Worker.js';

User.hasOne(Worker, { foreignKey: 'userId' });
Worker.belongsTo(User, { foreignKey: 'userId' });

Project.hasMany(Material, { foreignKey: 'projectId' });
Material.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(MaterialReceipt, { foreignKey: 'projectId' });
MaterialReceipt.belongsTo(Project, { foreignKey: 'projectId' });
Material.hasMany(MaterialReceipt, { foreignKey: 'materialId' });
MaterialReceipt.belongsTo(Material, { foreignKey: 'materialId' });
Supplier.hasMany(MaterialReceipt, { foreignKey: 'supplierId' });
MaterialReceipt.belongsTo(Supplier, { foreignKey: 'supplierId' });

Project.hasMany(MaterialIssue, { foreignKey: 'projectId' });
MaterialIssue.belongsTo(Project, { foreignKey: 'projectId' });
Material.hasMany(MaterialIssue, { foreignKey: 'materialId' });
MaterialIssue.belongsTo(Material, { foreignKey: 'materialId' });

Project.hasMany(ProjectPhase, { foreignKey: 'projectId' });
ProjectPhase.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(ProjectDocument, { foreignKey: 'projectId' });
ProjectDocument.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(ProjectAssignment, { foreignKey: 'projectId' });
ProjectAssignment.belongsTo(Project, { foreignKey: 'projectId' });
Worker.hasMany(ProjectAssignment, { foreignKey: 'workerId' });
ProjectAssignment.belongsTo(Worker, { foreignKey: 'workerId' });

Project.hasMany(Attendance, { foreignKey: 'projectId' });
Attendance.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(WorkActivity, { foreignKey: 'projectId' });
WorkActivity.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(EvidenceFile, { foreignKey: 'projectId' });
EvidenceFile.belongsTo(Project, { foreignKey: 'projectId' });

Worker.hasMany(Attendance, { foreignKey: 'workerId' });
Attendance.belongsTo(Worker, { foreignKey: 'workerId' });

export {
  Attendance,
  BomCategory,
  Device,
  EvidenceFile,
  Material,
  MaterialIssue,
  MaterialReceipt,
  Project,
  ProjectAssignment,
  ProjectDocument,
  ProjectPhase,
  Supplier,
  User,
  WorkActivity,
  Worker,
};
