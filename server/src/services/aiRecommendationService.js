import { env } from '../config/env.js';
import { Project } from '../models/index.js';

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};

const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
};

const truncate = (value, length = 240) => String(value || '').trim().slice(0, length);

function overdueDays(plannedEndDate, actualProgress) {
  if (!plannedEndDate || Number(actualProgress || 0) >= 100) return 0;
  const deadline = new Date(`${plannedEndDate}T00:00:00.000Z`);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (Number.isNaN(deadline.getTime()) || deadline.getTime() >= todayUtc) return 0;
  return Math.ceil((todayUtc - deadline.getTime()) / 86400000);
}

function normalizeProject(record) {
  const project = record.get ? record.get({ plain: true }) : record;
  const activities = (project.WorkActivities || []).filter((activity) => activity.status !== 'cancelled');
  const materials = project.Materials || [];
  const plannedProgress = round(average(activities.map((activity) => activity.plannedProgress)));
  const actualProgress = round(average(activities.map((activity) => activity.actualProgress)));
  const progressVariance = round(actualProgress - plannedProgress);
  const estimatedMaterialCost = round(materials.reduce((sum, material) => sum + Number(material.estimatedCost || 0), 0), 2);
  const actualMaterialCost = round(materials.reduce((sum, material) => sum + Number(material.actualCost || 0), 0), 2);

  const normalizedActivities = activities.map((activity) => ({
    id: activity.id,
    name: truncate(activity.activityName, 100),
    phase: truncate(activity.phase, 80),
    reportDate: activity.reportDate || String(activity.createdAt || '').slice(0, 10) || null,
    plannedProgress: round(activity.plannedProgress),
    actualProgress: round(activity.actualProgress),
    progressVariance: round(Number(activity.actualProgress || 0) - Number(activity.plannedProgress || 0)),
    overdueDays: overdueDays(activity.plannedEndDate, activity.actualProgress),
    status: activity.status,
    workCompleted: truncate(activity.description),
    constraint: truncate(activity.constraints),
  }));

  const normalizedMaterials = materials.map((material) => {
    const planned = Number(material.plannedQuantity || 0);
    const used = Number(material.usedQuantity || 0);
    return {
      id: material.id,
      name: truncate(material.materialName, 100),
      unit: truncate(material.unit, 30),
      plannedQuantity: round(planned, 2),
      usedQuantity: round(used, 2),
      quantityVariancePercent: planned > 0 ? round(((used - planned) / planned) * 100) : 0,
      estimatedCost: round(material.estimatedCost, 2),
      actualCost: round(material.actualCost, 2),
    };
  });

  return {
    id: project.id,
    projectName: truncate(project.projectName, 120),
    status: project.status,
    currency: project.currency || 'USD',
    deadline: project.deadline,
    plannedProgress,
    actualProgress,
    progressVariance,
    estimatedMaterialCost,
    actualMaterialCost,
    materialCostVariance: round(estimatedMaterialCost - actualMaterialCost, 2),
    activities: normalizedActivities,
    materials: normalizedMaterials,
  };
}

export function buildDeterministicRecommendations(facts) {
  const recommendations = [];

  facts.projects.forEach((project) => {
    const delayedActivities = project.activities.filter((activity) => (
      activity.status === 'delayed' || activity.progressVariance < -5 || activity.overdueDays > 0
    ));

    delayedActivities.slice(0, 2).forEach((activity) => {
      const timing = activity.overdueDays > 0 ? ` and is ${activity.overdueDays} day${activity.overdueDays === 1 ? '' : 's'} past its planned end date` : '';
      recommendations.push({
        category: 'progress',
        priority: activity.progressVariance <= -15 || activity.overdueDays >= 7 ? 'high' : 'medium',
        finding: `${activity.name} in ${project.projectName} is ${Math.abs(activity.progressVariance)} percentage point${Math.abs(activity.progressVariance) === 1 ? '' : 's'} behind plan${timing}.`,
        action: `Review the activity sequence, remove the reported constraint${activity.constraint ? ` (${activity.constraint})` : ''}, and agree a dated recovery action with the site team.`,
        rationale: 'The recommendation is based on the recorded planned-versus-actual progress variance and schedule dates.',
      });
    });

    project.materials.filter((material) => material.quantityVariancePercent > 10).slice(0, 2).forEach((material) => {
      recommendations.push({
        category: 'material',
        priority: material.quantityVariancePercent >= 20 ? 'high' : 'medium',
        finding: `${material.name} usage in ${project.projectName} is ${material.quantityVariancePercent}% above the planned quantity.`,
        action: 'Verify the issue records, completed work quantity and site wastage before approving additional procurement.',
        rationale: 'The used quantity exceeds the approved material baseline by more than the variance threshold.',
      });
    });

    if (project.materialCostVariance < 0) {
      recommendations.push({
        category: 'cost',
        priority: Math.abs(project.materialCostVariance) > project.estimatedMaterialCost * 0.1 ? 'high' : 'medium',
        finding: `${project.projectName} has recorded material costs ${Math.abs(project.materialCostVariance).toLocaleString()} ${project.currency} above its material cost baseline.`,
        action: 'Reconcile invoices, receipt quantities and approved unit rates before the next payment or purchase approval.',
        rationale: 'Recorded actual material cost is higher than the estimated material cost baseline.',
      });
    }
  });

  if (!recommendations.length) {
    recommendations.push({
      category: 'progress',
      priority: 'low',
      finding: 'No major exception was found in the currently recorded planned-versus-actual values.',
      action: 'Continue daily progress recording and review the variance dashboard at the next coordination meeting.',
      rationale: 'Current records do not cross the configured progress, schedule, material or cost thresholds.',
    });
  }

  return recommendations.slice(0, 8);
}

function recommendationText(item) {
  return `${item.finding} ${item.action}`.trim();
}

function structuredOutputSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      executiveSummary: {
        type: 'string',
        description: 'A concise management summary in clear professional English using only supplied facts.',
      },
      reportNarrative: {
        type: 'string',
        description: 'A short formal report covering observed performance, important variances, constraints and required follow-up.',
      },
      recommendations: {
        type: 'array',
        minItems: 1,
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            category: { type: 'string', enum: ['progress', 'schedule', 'material', 'cost', 'data_quality'] },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            finding: { type: 'string' },
            action: { type: 'string' },
            rationale: { type: 'string' },
          },
          required: ['category', 'priority', 'finding', 'action', 'rationale'],
        },
      },
    },
    required: ['executiveSummary', 'reportNarrative', 'recommendations'],
  };
}

function validGeneratedResult(value) {
  return value
    && typeof value.executiveSummary === 'string'
    && typeof value.reportNarrative === 'string'
    && Array.isArray(value.recommendations)
    && value.recommendations.length > 0
    && value.recommendations.every((item) => (
      item && typeof item.finding === 'string' && typeof item.action === 'string' && typeof item.rationale === 'string'
    ));
}

async function requestGemini(facts) {
  if (!env.gemini.apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.gemini.timeoutMs);
  const prompt = [
    'You are the assisted construction-analysis layer for SCPRAS.',
    'Analyze only the validated facts in the supplied JSON. Never invent quantities, dates, causes, people, costs or completed work.',
    'Explain planned-versus-actual variances in simple, professional English suitable for a construction project manager.',
    'Each recommendation must state the observed fact, a practical next action, and why that action follows from the data.',
    'Do not present recommendations as autonomous decisions. Use language that requires verification and managerial approval.',
    'If evidence is incomplete, classify it as data_quality and request the missing record instead of guessing.',
    `Validated SCPRAS facts:\n${JSON.stringify(facts)}`,
  ].join('\n\n');

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.gemini.apiKey,
      },
      body: JSON.stringify({
        model: env.gemini.model,
        input: prompt,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: structuredOutputSchema(),
        },
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 1800,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();
    const text = (payload.steps || [])
      .filter((step) => step.type === 'model_output')
      .flatMap((step) => step.content || [])
      .filter((content) => content.type === 'text')
      .map((content) => content.text || '')
      .join('')
      .trim();
    const generated = JSON.parse(text);
    if (!validGeneratedResult(generated)) throw new Error('Gemini returned an invalid recommendation structure.');
    return generated;
  } finally {
    clearTimeout(timeout);
  }
}

function buildFacts(projects) {
  const allActivities = projects.flatMap((project) => project.activities);
  const allMaterials = projects.flatMap((project) => project.materials);
  const plannedProgress = round(average(allActivities.map((activity) => activity.plannedProgress)));
  const actualProgress = round(average(allActivities.map((activity) => activity.actualProgress)));
  const estimatedMaterialCost = round(projects.reduce((sum, project) => sum + project.estimatedMaterialCost, 0), 2);
  const actualMaterialCost = round(projects.reduce((sum, project) => sum + project.actualMaterialCost, 0), 2);
  const delayedActivities = allActivities.filter((activity) => (
    activity.status === 'delayed' || activity.progressVariance < -5 || activity.overdueDays > 0
  ));
  const highVarianceMaterials = allMaterials.filter((material) => material.quantityVariancePercent > 10);
  const overBudgetProjects = projects.filter((project) => project.materialCostVariance < 0);
  const delayedProjectIds = new Set(projects.filter((project) => (
    project.status === 'delayed'
    || project.status === 'at_risk'
    || project.activities.some((activity) => activity.status === 'delayed' || activity.progressVariance < -5 || activity.overdueDays > 0)
  )).map((project) => project.id));
  const scheduleVarianceDays = delayedActivities.reduce((maximum, activity) => Math.max(maximum, activity.overdueDays), 0);
  const materialVariancePercent = round(average(highVarianceMaterials.map((material) => material.quantityVariancePercent)));
  const progressGap = round(actualProgress - plannedProgress);
  const completionProbability = Math.max(35, Math.min(98, Math.round(
    92 + progressGap - delayedProjectIds.size * 5 - highVarianceMaterials.length * 2 - overBudgetProjects.length * 3,
  )));

  return {
    generatedAt: new Date().toISOString(),
    dataSource: 'SCPRAS relational database',
    portfolio: {
      projectCount: projects.length,
      activityRecordCount: allActivities.length,
      materialRecordCount: allMaterials.length,
      plannedProgress,
      actualProgress,
      progressVariance: progressGap,
      estimatedMaterialCost,
      actualMaterialCost,
      materialCostVariance: round(estimatedMaterialCost - actualMaterialCost, 2),
      currency: projects.length && projects.every((project) => project.currency === projects[0].currency) ? projects[0].currency : 'mixed currencies',
      maximumScheduleDelayDays: scheduleVarianceDays,
    },
    risks: {
      materialVariance: highVarianceMaterials.length,
      delayedProjects: delayedProjectIds.size,
      overBudgetProjects: overBudgetProjects.length,
    },
    completionProbability,
    projects,
  };
}

export async function buildPortfolioAiInsights({ projectId } = {}) {
  const where = projectId ? { id: Number(projectId) } : {};
  const records = await Project.findAll({
    where,
    include: [
      { association: 'Materials' },
      { association: 'WorkActivities' },
    ],
    order: [['id', 'ASC']],
  });
  const facts = buildFacts(records.map(normalizeProject));
  const fallbackDetails = buildDeterministicRecommendations(facts);
  const fallbackSummary = facts.portfolio.activityRecordCount
    ? `Across ${facts.portfolio.projectCount} project${facts.portfolio.projectCount === 1 ? '' : 's'}, recorded actual progress is ${facts.portfolio.actualProgress}% against ${facts.portfolio.plannedProgress}% planned, a variance of ${facts.portfolio.progressVariance} percentage points.`
    : 'No site-progress activity records are currently available for planned-versus-actual analysis.';
  let generated = null;
  let geminiError = null;

  if (env.gemini.apiKey) {
    try {
      generated = await requestGemini(facts);
    } catch (error) {
      geminiError = error;
      console.warn(`Gemini recommendation fallback used: ${error.message}`);
    }
  }

  const recommendationDetails = generated?.recommendations || fallbackDetails;
  const recommendations = recommendationDetails.map(recommendationText);
  const executiveSummary = generated?.executiveSummary || fallbackSummary;
  const reportNarrative = generated?.reportNarrative || `${fallbackSummary} The listed actions are transparent rule-based decision support and require review by authorized project personnel.`;

  return {
    generatedAt: facts.generatedAt,
    completionProbability: facts.completionProbability,
    risks: facts.risks,
    recommendations,
    recommendationDetails,
    executiveSummary,
    reportNarrative,
    analysis: {
      plannedProgress: facts.portfolio.plannedProgress,
      actualProgress: facts.portfolio.actualProgress,
      progressGap: facts.portfolio.progressVariance,
      plannedBudget: facts.portfolio.estimatedMaterialCost,
      actualSpend: facts.portfolio.actualMaterialCost,
      budgetVariance: facts.portfolio.materialCostVariance,
      materialVariancePercent: round(average(facts.projects.flatMap((project) => project.materials).map((material) => material.quantityVariancePercent))),
      scheduleVarianceDays: facts.portfolio.maximumScheduleDelayDays,
      currency: facts.portfolio.currency,
      recommendations,
    },
    evidence: {
      source: facts.dataSource,
      projectCount: facts.portfolio.projectCount,
      activityRecordCount: facts.portfolio.activityRecordCount,
      materialRecordCount: facts.portfolio.materialRecordCount,
      projects: facts.projects.map((project) => ({
        id: project.id,
        projectName: project.projectName,
        plannedProgress: project.plannedProgress,
        actualProgress: project.actualProgress,
        progressVariance: project.progressVariance,
      })),
    },
    ai: {
      enabled: Boolean(env.gemini.apiKey),
      used: Boolean(generated),
      provider: generated ? 'Google Gemini' : 'SCPRAS deterministic fallback',
      model: generated ? env.gemini.model : null,
      humanReviewRequired: true,
      notice: generated
        ? 'Gemini converted validated SCPRAS facts into structured decision-support text.'
        : env.gemini.apiKey
          ? 'Gemini was unavailable, so SCPRAS returned transparent rule-based recommendations.'
          : 'Add GEMINI_API_KEY on the server to enable Gemini-generated recommendations.',
      fallbackReason: geminiError ? 'provider_unavailable_or_invalid_response' : null,
    },
  };
}
