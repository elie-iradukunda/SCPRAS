import { Project, Worker, Attendance, Material, User } from '../models/index.js';

export async function getDashboard(req, res, next) {
  try {
    const projects = await Project.findAll();
    const workers = await Worker.findAll();
    const materials = await Material.findAll();
    const attendance = await Attendance.findAll();
    const users = await User.findAll();

    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const overallProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;
    const totalWorkers = workers.length;
    const totalMaterials = materials.length;
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);

    res.json({
      metrics: {
        projects: projects.length,
        activeProjects,
        overallProgress,
        workers: totalWorkers,
        materials: totalMaterials,
        totalBudget,
        users: users.length,
      },
      projectsByStatus: {
        planning: projects.filter((p) => p.status === 'planning').length,
        active: projects.filter((p) => p.status === 'active').length,
        on_track: projects.filter((p) => p.status === 'on_track').length,
        at_risk: projects.filter((p) => p.status === 'at_risk').length,
        delayed: projects.filter((p) => p.status === 'delayed').length,
        completed: projects.filter((p) => p.status === 'completed').length,
        on_hold: projects.filter((p) => p.status === 'on_hold').length,
      },
      workersByRole: {
        admin: users.filter((u) => u.role === 'admin').length,
        project_manager: users.filter((u) => u.role === 'project_manager').length,
        site_engineer: users.filter((u) => u.role === 'site_engineer').length,
        worker: users.filter((u) => u.role === 'worker').length,
      },
      insights: [
        `${activeProjects} projects currently active`,
        `${totalWorkers} workers on staff`,
        `Overall project progress: ${overallProgress}%`,
        `Total project budget: $${totalBudget}`,
        `${totalMaterials} materials tracked`,
      ],
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectMetrics(req, res, next) {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Material,
          attributes: ['id', 'estimatedCost', 'actualCost'],
        },
        {
          model: Attendance,
          attributes: ['id', 'hoursWorked'],
        },
      ],
    });

    const projectMetrics = projects.map((project) => {
      const plannedBudget = Number(project.budget);
      const actualBudget = project.Materials.reduce((sum, m) => sum + Number(m.actualCost || 0), 0);
      const totalHours = project.Attendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);

      return {
        id: project.id,
        projectName: project.projectName,
        status: project.status,
        progress: project.progress,
        plannedBudget,
        actualBudget,
        budgetVariance: plannedBudget - actualBudget,
        totalHoursWorked: totalHours,
        deadline: project.deadline,
      };
    });

    res.json(projectMetrics);
  } catch (error) {
    next(error);
  }
}

export async function getWorkerMetrics(req, res, next) {
  try {
    const workers = await Worker.findAll({
      include: [
        {
          model: User,
          attributes: ['fullName', 'email', 'role'],
        },
        {
          model: Attendance,
          attributes: ['id', 'hoursWorked', 'status'],
        },
      ],
    });

    const workerMetrics = workers.map((worker) => {
      const attendanceRecords = worker.Attendances || [];
      const totalHoursWorked = attendanceRecords.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
      const presentDays = attendanceRecords.filter((a) => a.status === 'present').length;
      const absentDays = attendanceRecords.filter((a) => a.status === 'absent').length;
      const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentDays / attendanceRecords.length) * 100) : 0;

      return {
        id: worker.id,
        fullName: worker.User?.fullName,
        position: worker.position,
        totalHoursWorked,
        presentDays,
        absentDays,
        attendanceRate,
        productivityScore: worker.productivityScore,
      };
    });

    res.json(workerMetrics);
  } catch (error) {
    next(error);
  }
}

export async function getBudgetAnalysis(req, res, next) {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: Material,
          attributes: ['estimatedCost', 'actualCost'],
        },
      ],
    });

    const budgetAnalysis = projects.map((project) => {
      const plannedBudget = Number(project.budget);
      const actualBudget = project.Materials.reduce((sum, m) => sum + Number(m.actualCost || 0), 0);
      const variance = plannedBudget - actualBudget;
      const variancePercent = plannedBudget > 0 ? Math.round((variance / plannedBudget) * 100) : 0;

      return {
        id: project.id,
        projectName: project.projectName,
        plannedBudget,
        actualBudget,
        variance,
        variancePercent,
        status: variance >= 0 ? 'under_budget' : 'over_budget',
      };
    });

    const totalPlannedBudget = budgetAnalysis.reduce((sum, p) => sum + p.plannedBudget, 0);
    const totalActualBudget = budgetAnalysis.reduce((sum, p) => sum + p.actualBudget, 0);

    res.json({
      summary: {
        totalPlannedBudget,
        totalActualBudget,
        totalVariance: totalPlannedBudget - totalActualBudget,
      },
      projectsAnalysis: budgetAnalysis,
    });
  } catch (error) {
    next(error);
  }
}

