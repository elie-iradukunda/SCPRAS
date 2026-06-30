import { env } from '../config/env.js';
import { analyzeDemoBaseline, getDemoInsights } from '../data/demoStore.js';
import { buildPortfolioAiInsights } from '../services/aiRecommendationService.js';

function demoInsights(body = {}) {
  const insights = getDemoInsights();
  const analysis = analyzeDemoBaseline(body);
  return {
    ...insights,
    analysis,
    executiveSummary: 'Demonstration values are being used because the application is running in demo mode.',
    reportNarrative: 'Connect SCPRAS to the project database and configure GEMINI_API_KEY before treating this output as a live project recommendation.',
    ai: {
      enabled: false,
      used: false,
      provider: 'SCPRAS demonstration fallback',
      model: null,
      humanReviewRequired: true,
      notice: 'This result is demonstration data, not a Gemini response from live project records.',
    },
  };
}

export async function getInsights(req, res, next) {
  if (env.demoMode) return res.json(demoInsights());

  try {
    const insights = await buildPortfolioAiInsights({ projectId: req.query.projectId });
    return res.json(insights);
  } catch (error) {
    return next(error);
  }
}

export async function analyzeBaseline(req, res, next) {
  if (env.demoMode) return res.json(demoInsights(req.body).analysis);

  try {
    const insights = await buildPortfolioAiInsights({ projectId: req.body.projectId });
    return res.json(insights.analysis);
  } catch (error) {
    return next(error);
  }
}
