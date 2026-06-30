import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  HardHat,
  Info,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { insights as fallbackInsights } from '../../data/mockData.js';
import { api } from '../../services/api.js';

const fallbackData = {
  completionProbability: 87,
  recommendations: fallbackInsights.map((insight) => insight.title || insight),
  risks: {
    materialVariance: 1,
    delayedProjects: 1,
    overBudgetProjects: 2,
  },
};

const RISK_CONFIG = [
  { key: 'materialVariance',  label: 'Material Variances',  icon: AlertTriangle, color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  { key: 'delayedProjects',   label: 'Delayed Projects',    icon: Clock,         color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200'   },
  { key: 'overBudgetProjects',label: 'Over-Budget Projects',icon: TrendingUp,    color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200'},
];

function getRecommendationConfig(text) {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('risk') || lower.includes('danger') || lower.includes('critical'))
    return { icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-700',     label: 'Risk' };
  if (lower.includes('delay') || lower.includes('behind') || lower.includes('late') || lower.includes('schedule'))
    return { icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', label: 'Delay' };
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('spend') || lower.includes('over'))
    return { icon: DollarSign,    color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700',label: 'Budget' };
  if (lower.includes('worker') || lower.includes('labor') || lower.includes('labour') || lower.includes('crew') || lower.includes('staff'))
    return { icon: HardHat,       color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   label: 'Labour' };
  if (lower.includes('material') || lower.includes('stock') || lower.includes('cement') || lower.includes('supply'))
    return { icon: TrendingDown,  color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700',label: 'Material' };
  if (lower.includes('complet') || lower.includes('finish') || lower.includes('progress') || lower.includes('ahead'))
    return { icon: CheckCircle2,  color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700',label: 'Progress' };
  return { icon: Info,            color: 'text-slate-600',  bg: 'bg-slate-50',   border: 'border-slate-200',  badge: 'bg-slate-100 text-slate-600',  label: 'Info' };
}

export default function AiInsights() {
  const [insights, setInsights] = useState(fallbackData);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const insightsResponse = await api.get('/ai/insights');
      setInsights(insightsResponse.data);
      setAnalysis(insightsResponse.data.analysis || null);
      setLastUpdated(new Date());
    } catch {
      setInsights(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInsights() {
      setIsLoading(true);
      try {
        const insightsResponse = await api.get('/ai/insights');
        if (!ignore) {
          setInsights(insightsResponse.data);
          setAnalysis(insightsResponse.data.analysis || null);
          setLastUpdated(new Date());
        }
      } catch {
        if (!ignore) setInsights(fallbackData);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadInsights();
    return () => { ignore = true; };
  }, []);

  const riskCount = useMemo(() => Object.values(insights.risks || {}).reduce((total, v) => total + Number(v || 0), 0), [insights]);
  const recommendations = useMemo(() => {
    const raw = insights.recommendations || fallbackData.recommendations;
    return Array.isArray(raw) ? raw : [];
  }, [insights]);

  const highRiskCount = useMemo(() => recommendations.filter((r) => {
    const lower = String(r).toLowerCase();
    return lower.includes('risk') || lower.includes('critical') || lower.includes('danger');
  }).length, [recommendations]);

  const predictedBudget = analysis ? Number(analysis.actualSpend || 0) : 255000;
  const budgetVariance = analysis ? Number(analysis.budgetVariance || 0) : 10000;
  const isOverBudget = budgetVariance < 0;
  const currency = analysis?.currency || 'USD';
  const formatMoney = (value) => currency === 'mixed currencies'
    ? `${Number(value || 0).toLocaleString()} (mixed currencies)`
    : new Intl.NumberFormat('en', { style: 'currency', currency }).format(Number(value || 0));

  const completionPct = Math.round(insights.completionProbability || 0);
  const completionColor = completionPct >= 75 ? 'text-emerald-700' : completionPct >= 50 ? 'text-amber-700' : 'text-red-700';
  const completionBar = completionPct >= 75 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="AI Analytics"
        title="Gemini-Assisted Variance Recommendations"
        description="Convert validated daily planned-versus-actual records into clear management recommendations and reports."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            onClick={fetchInsights}
            disabled={isLoading}
            type="button"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {lastUpdated && (
        <p className="text-xs text-slate-400">Last updated: {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
      )}

      {insights.ai && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${insights.ai.used ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          <strong>{insights.ai.provider}</strong>{insights.ai.model ? ` · ${insights.ai.model}` : ''}: {insights.ai.notice}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Completion Probability" value={`${completionPct}%`} icon={TrendingUp} tone="green" />
        <StatCard label="AI Predictions" value={recommendations.length} icon={Brain} tone="purple" />
        <StatCard label="Active Risk Alerts" value={riskCount} icon={AlertTriangle} tone="gold" />
      </div>

      <div className="panel-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Bot size={20} className="text-blue-700" /><h3 className="font-extrabold text-ink">Management Summary and Report</h3></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Human review required</span>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{insights.executiveSummary || 'No management summary is available.'}</p>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">{insights.reportNarrative || 'No report narrative is available.'}</p>
      </div>

      {/* Risk breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {RISK_CONFIG.map(({ key, label, icon: Icon, color, bg, border }) => {
          const value = Number(insights.risks?.[key] || 0);
          return (
            <div key={key} className={`flex items-center gap-4 rounded-xl border p-4 ${value > 0 ? `${bg} ${border}` : 'border-slate-200 bg-white'}`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${value > 0 ? bg : 'bg-slate-100'} ${value > 0 ? color : 'text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">{label}</p>
                <p className={`text-2xl font-extrabold ${value > 0 ? color : 'text-ink'}`}>{value}</p>
              </div>
              {value === 0 && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Recommendations */}
        <div className="panel-pad">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-blue-700" />
              <h3 className="font-extrabold text-ink">AI Recommendations</h3>
            </div>
            <div className="flex gap-2">
              {highRiskCount > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{highRiskCount} high risk</span>
              )}
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                <Zap size={11} className="inline" /> {recommendations.length} insights
              </span>
            </div>
          </div>
          {recommendations.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400">No recommendations available.</div>
          ) : (
            <div className="space-y-2.5">
              {recommendations.map((rec, index) => {
                const text = typeof rec === 'string' ? rec : rec?.title || String(rec);
                const cfg = getRecommendationConfig(text);
                const Icon = cfg.icon;
                return (
                  <div key={index} className={`flex items-start gap-3 rounded-lg border p-3.5 ${cfg.bg} ${cfg.border}`}>
                    <Icon size={17} className={`mt-0.5 shrink-0 ${cfg.color}`} />
                    <p className={`flex-1 text-sm font-medium leading-5 ${cfg.color}`}>{text}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget prediction */}
        <div className="space-y-5">
          <div className="panel-pad">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-blue-700" />
              <h3 className="font-extrabold text-ink">Budget Prediction</h3>
            </div>
            <p className={`mt-4 text-4xl font-extrabold ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatMoney(predictedBudget)}
            </p>
            <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${isOverBudget ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {isOverBudget ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isOverBudget
                ? `${formatMoney(Math.abs(budgetVariance))} over baseline`
                : `${formatMoney(Math.abs(budgetVariance))} under baseline`}
            </div>
            <div className={`mt-4 rounded-lg border p-4 text-sm leading-6 ${isOverBudget ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {analysis?.recommendations?.[0] || 'AI analysis is connected to project progress, budget and material variance baselines.'}
            </div>
          </div>

          {/* Completion confidence */}
          <div className="panel-pad">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-700" />
              <h3 className="font-extrabold text-ink">Completion Confidence</h3>
            </div>
            <p className={`mt-4 text-4xl font-extrabold ${completionColor}`}>{completionPct}%</p>
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-500">
                <span>Overall confidence</span>
                <span>{completionPct >= 75 ? 'High' : completionPct >= 50 ? 'Medium' : 'Low'}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-3 rounded-full transition-all ${completionBar}`} style={{ width: `${completionPct}%` }} />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {completionPct >= 75
                ? 'Projects are on track. Continue current pace to meet deadlines.'
                : completionPct >= 50
                ? 'Moderate risk detected. Review delayed phases and resource allocation.'
                : 'High risk of delay. Immediate intervention recommended for at-risk projects.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
