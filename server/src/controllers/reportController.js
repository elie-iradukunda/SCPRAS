import { Op } from 'sequelize';
import { Project, Worker, Attendance, Material, User } from '../models/index.js';

export async function listReports(req, res, next) {
  try {
    const reports = [
      { id: 1, name: 'Project Progress Report',  format: 'PDF',   status: 'Ready', type: 'progress'  },
      { id: 2, name: 'Material Tracking Report', format: 'Excel', status: 'Ready', type: 'material'   },
      { id: 3, name: 'Attendance Report',        format: 'PDF',   status: 'Ready', type: 'attendance' },
      { id: 4, name: 'AI Insights Report',       format: 'JSON',  status: 'Ready', type: 'ai'         },
      { id: 5, name: 'Workforce Report',         format: 'PDF',   status: 'Ready', type: 'workforce'  },
      { id: 6, name: 'Financial Summary Report', format: 'Excel', status: 'Ready', type: 'financial'  },
    ];

    const reportAccess = {
      admin: ['progress', 'material', 'attendance', 'ai', 'workforce', 'financial'],
      project_manager: ['progress', 'material', 'attendance', 'ai', 'workforce', 'financial'],
      site_engineer: ['progress', 'attendance', 'ai'],
      quantity_surveyor: ['material', 'ai', 'financial'],
      store_officer: ['material'],
      contractor_foreman: ['progress', 'attendance', 'workforce'],
    };
    const allowed = reportAccess[req.user?.role] || [];
    res.json(reports.filter((report) => allowed.includes(report.type)));
  } catch (error) {
    next(error);
  }
}

export async function generateProgressReport(req, res, next) {
  try {
    const { projectId, startDate, endDate } = req.query;

    let where = {};

    if (projectId) where.id = projectId;

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: Material,
          attributes: ['id', 'materialName', 'usedQuantity', 'plannedQuantity'],
        },
        {
          model: Attendance,
          attributes: ['id', 'hoursWorked'],
        },
      ],
    });

    const report = {
      title: 'Project Progress Report',
      generatedAt: new Date(),
      projects: projects.map((project) => ({
        id: project.id,
        projectName: project.projectName,
        location: project.location,
        status: project.status,
        progress: project.progress,
        budget: project.budget,
        deadline: project.deadline,
        totalMaterials: project.Materials.length,
        totalHoursWorked: project.Attendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
        materialsUsed: project.Materials.filter((m) => m.usedQuantity > 0).length,
      })),
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
}

export async function generateMaterialReport(req, res, next) {
  try {
    const { projectId } = req.query;

    let where = {};

    if (projectId) where.projectId = projectId;

    const materials = await Material.findAll({
      where,
      include: [
        {
          model: Project,
          attributes: ['projectName', 'location', 'budget'],
        },
      ],
    });

    const report = {
      title: 'Material Tracking Report',
      generatedAt: new Date(),
      summary: {
        totalMaterials: materials.length,
        totalPlannedCost: materials.reduce((sum, m) => sum + Number(m.estimatedCost || 0), 0),
        totalActualCost: materials.reduce((sum, m) => sum + Number(m.actualCost || 0), 0),
        receivedMaterials: materials.filter((m) => m.status === 'received').length,
        pendingMaterials: materials.filter((m) => m.status === 'pending').length,
      },
      materials,
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
}

export async function generateAttendanceReport(req, res, next) {
  try {
    const { projectId, startDate, endDate } = req.query;

    let where = {};

    if (projectId) where.projectId = projectId;

    if (startDate && endDate) {
      where.checkIn = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [
        {
          model: Worker,
          include: [{ model: User, attributes: ['fullName'] }],
        },
        {
          model: Project,
          attributes: ['projectName', 'location'],
        },
      ],
    });

    const report = {
      title: 'Attendance Report',
      generatedAt: new Date(),
      summary: {
        totalRecords: attendance.length,
        presentCount: attendance.filter((a) => a.status === 'present').length,
        absentCount: attendance.filter((a) => a.status === 'absent').length,
        lateCount: attendance.filter((a) => a.status === 'late').length,
        on_leaveCount: attendance.filter((a) => a.status === 'on_leave').length,
        half_dayCount: attendance.filter((a) => a.status === 'half_day').length,
        totalHoursWorked: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
      },
      attendance,
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
}

export async function generateBudgetReport(req, res, next) {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Material,
          attributes: ['estimatedCost', 'actualCost'],
        },
      ],
    });

    const projectReports = projects.map((project) => {
      const plannedBudget = Number(project.budget);
      const actualBudget = project.Materials.reduce((sum, m) => sum + Number(m.actualCost || 0), 0);
      const variance = plannedBudget - actualBudget;

      return {
        id: project.id,
        projectName: project.projectName,
        plannedBudget,
        actualBudget,
        variance,
        status: variance >= 0 ? 'under_budget' : 'over_budget',
      };
    });

    const report = {
      title: 'Budget Analysis Report',
      generatedAt: new Date(),
      summary: {
        totalPlannedBudget: projectReports.reduce((sum, p) => sum + p.plannedBudget, 0),
        totalActualBudget: projectReports.reduce((sum, p) => sum + p.actualBudget, 0),
        projects: projectReports.length,
        over_budget_projects: projectReports.filter((p) => p.status === 'over_budget').length,
      },
      projects: projectReports,
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
}

export async function generateWorkforceReport(req, res, next) {
  try {
    const workers = await Worker.findAll({
      include: [
        {
          model: User,
          attributes: ['fullName', 'email', 'role', 'phone'],
        },
        {
          model: Attendance,
          attributes: ['id', 'hoursWorked', 'status'],
        },
      ],
    });

    const workerReports = workers.map((worker) => {
      const attendance = worker.Attendances || [];
      const presentDays = attendance.filter((a) => a.status === 'present').length;
      const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;

      return {
        id: worker.id,
        fullName: worker.User?.fullName,
        position: worker.position,
        salary: worker.salary,
        totalHoursWorked: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
        attendanceRate,
        productivityScore: worker.productivityScore,
      };
    });

    const report = {
      title: 'Workforce Report',
      generatedAt: new Date(),
      summary: {
        totalWorkers: workers.length,
        activeWorkers: workers.filter((w) => w.status === 'active').length,
        totalPayroll: workers.reduce((sum, w) => sum + Number(w.salary || 0), 0),
      },
      workers: workerReports,
    };

    res.json(report);
  } catch (error) {
    next(error);
  }
}

export async function generateAiReport(req, res, next) {
  try {
    const [projects, materials] = await Promise.all([
      Project.findAll({ include: [{ model: Material, attributes: ['estimatedCost', 'actualCost', 'plannedQuantity', 'usedQuantity', 'materialName'] }] }),
      Material.findAll({ include: [{ model: Project, attributes: ['projectName'] }] }),
    ]);

    const highVariance = materials.filter((m) => {
      const planned = Number(m.plannedQuantity || 0);
      const used = Number(m.usedQuantity || 0);
      return planned > 0 && ((used - planned) / planned) > 0.1;
    });
    const delayed = projects.filter((p) => p.status === 'delayed' || p.status === 'at_risk');
    const overBudget = projects.filter((p) => {
      const actual = p.Materials.reduce((sum, m) => sum + Number(m.actualCost || 0), 0);
      return actual > Number(p.budget);
    });

    const recommendations = [
      ...highVariance.map((m) => `${m.materialName} usage is above plan in ${m.Project?.projectName || 'a project'}. Review procurement.`),
      ...delayed.map((p) => `${p.projectName} is delayed. Schedule recovery action required.`),
      ...overBudget.map((p) => `${p.projectName} is trending over budget. Review cost control.`),
      'Conduct weekly BOQ baseline review to catch variances early.',
    ].slice(0, 8);

    res.json({
      title: 'AI Insights Report',
      generatedAt: new Date(),
      completionProbability: delayed.length > 0 ? 78 : 91,
      risks: {
        materialVariance: highVariance.length,
        delayedProjects: delayed.length,
        overBudgetProjects: overBudget.length,
      },
      recommendations,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateFinancialReport(req, res, next) {
  return generateBudgetReport(req, res, next);
}
