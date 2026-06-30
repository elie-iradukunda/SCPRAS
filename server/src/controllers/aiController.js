import { env } from '../config/env.js';
import { analyzeDemoBaseline, getDemoInsights } from '../data/demoStore.js';
import { Material, Project } from '../models/index.js';

export async function getInsights(req, res, next) {
  if (env.demoMode) {
    return res.json(getDemoInsights());
  }

  try {
    const [projects, materials] = await Promise.all([
      Project.findAll(),
      Material.findAll({ include: [{ model: Project, attributes: ['projectName'] }] }),
    ]);

    const highVariance = materials.filter((m) => {
      const planned = Number(m.plannedQuantity || 0);
      const used = Number(m.usedQuantity || 0);
      return planned > 0 && (used - planned) / planned > 0.1;
    });
    const delayed = projects.filter((p) => p.status === 'delayed' || p.status === 'at_risk');
    const overBudget = projects.filter((p) => {
      const actual = materials
        .filter((m) => m.projectId === p.id)
        .reduce((sum, m) => sum + Number(m.actualCost || 0), 0);
      return actual > Number(p.budget);
    });

    const recommendations = [
      ...highVariance.map((m) => `${m.materialName} usage is above plan in ${m.Project?.projectName || 'a project'}. Review procurement.`),
      ...delayed.map((p) => `${p.projectName} is delayed. Schedule recovery action required.`),
      ...overBudget.map((p) => `${p.projectName} is trending over budget. Review cost control.`),
      'Conduct weekly BOQ baseline review to catch variances early.',
      'Verify all material deliveries match purchase orders before recording receipts.',
    ].slice(0, 8);

    return res.json({
      completionProbability: delayed.length > 0 ? Math.max(45, 91 - delayed.length * 8) : 91,
      recommendations,
      risks: {
        materialVariance: highVariance.length,
        delayedProjects: delayed.length,
        overBudgetProjects: overBudget.length,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function analyzeBaseline(req, res, next) {
  try {
    return res.json(analyzeDemoBaseline(req.body));
  } catch (error) {
    return next(error);
  }
}
