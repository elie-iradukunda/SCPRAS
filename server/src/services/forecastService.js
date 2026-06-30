const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const addDays = (dateValue, days) => {
  const date = dateValue ? new Date(dateValue) : new Date();
  date.setDate(date.getDate() + Math.max(0, days - 1));
  return date.toISOString().slice(0, 10);
};

const weatherMultipliers = {
  low: 1,
  medium: 0.9,
  high: 0.78,
};

const riskLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function forecastWorkforce(input = {}) {
  const quantity = toNumber(input.quantity);
  const completedQuantity = toNumber(input.completedQuantity);
  const remainingQuantity = Math.max(0, quantity - completedQuantity);
  const targetDays = Math.max(1, toNumber(input.days, 1));
  const dailyProductivity = Math.max(1, toNumber(input.dailyProductivity, 1));
  const currentWorkers = Math.max(0, toNumber(input.currentWorkers));
  const laborRate = Math.max(0, toNumber(input.laborRate));
  const workingHours = Math.max(1, toNumber(input.workingHours, 8));
  const overtimeHours = Math.max(0, toNumber(input.overtimeHours));
  const overheadPercent = Math.max(0, toNumber(input.overheadPercent));
  const bufferPercent = Math.max(0, toNumber(input.bufferPercent, 10));
  const complexityFactor = clamp(toNumber(input.complexityFactor, 1), 0.5, 2.5);
  const weatherRisk = input.weatherRisk || 'low';
  const weatherMultiplier = weatherMultipliers[weatherRisk] || weatherMultipliers.low;
  const overtimeBoost = Math.min(0.35, overtimeHours / workingHours);
  const effectiveProductivity = Math.max(1, dailyProductivity * weatherMultiplier * (1 + overtimeBoost) / complexityFactor);
  const bufferedQuantity = Math.ceil(remainingQuantity * (1 + bufferPercent / 100));
  const dailyTarget = Math.ceil(bufferedQuantity / targetDays);
  const requiredWorkers = Math.max(1, Math.ceil(dailyTarget / effectiveProductivity));
  const plannedWorkers = Math.max(requiredWorkers, currentWorkers || requiredWorkers);
  const workerGap = Math.max(0, requiredWorkers - currentWorkers);
  const currentCapacityPerDay = Math.round(currentWorkers * effectiveProductivity);
  const plannedCapacityPerDay = Math.round(plannedWorkers * effectiveProductivity);
  const estimatedDurationWithCurrentCrew = currentCapacityPerDay > 0 ? Math.ceil(bufferedQuantity / currentCapacityPerDay) : null;
  const estimatedDuration = Math.max(1, Math.ceil(bufferedQuantity / Math.max(1, plannedCapacityPerDay)));
  const regularLaborCost = plannedWorkers * estimatedDuration * laborRate;
  const overtimeCost = plannedWorkers * estimatedDuration * overtimeHours * (laborRate / workingHours) * 1.5;
  const overheadCost = (regularLaborCost + overtimeCost) * (overheadPercent / 100);
  const laborCost = Math.round(regularLaborCost + overtimeCost + overheadCost);
  const schedulePressure = estimatedDurationWithCurrentCrew ? Math.max(0, estimatedDurationWithCurrentCrew - targetDays) : targetDays;
  const riskPenalty = (weatherRisk === 'high' ? 14 : weatherRisk === 'medium' ? 7 : 0) + Math.max(0, complexityFactor - 1) * 12 + schedulePressure * 2 + workerGap * 3;
  const completionProbability = clamp(Math.round(96 - riskPenalty), 35, 98);
  const riskLevel = completionProbability >= 82 ? 'low' : completionProbability >= 65 ? 'medium' : 'high';
  const startDate = input.startDate || new Date().toISOString().slice(0, 10);
  const targetFinishDate = addDays(startDate, targetDays);
  const forecastFinishDate = addDays(startDate, estimatedDuration);
  const currentCrewFinishDate = estimatedDurationWithCurrentCrew ? addDays(startDate, estimatedDurationWithCurrentCrew) : null;
  const unit = input.unit || 'units';

  const schedule = Array.from({ length: Math.min(6, estimatedDuration) }).map((_, index) => {
    const dayStart = Math.floor((estimatedDuration / Math.min(6, estimatedDuration)) * index) + 1;
    const dayEnd = Math.floor((estimatedDuration / Math.min(6, estimatedDuration)) * (index + 1));
    const plannedQuantity = Math.min(bufferedQuantity, plannedCapacityPerDay * dayEnd);
    return {
      period: estimatedDuration <= 6 ? `Day ${index + 1}` : `Days ${dayStart}-${dayEnd}`,
      targetQuantity: Math.round(plannedQuantity),
      cumulativePercent: bufferedQuantity > 0 ? Math.min(100, Math.round((plannedQuantity / bufferedQuantity) * 100)) : 100,
    };
  });

  const recommendations = [];
  if (workerGap > 0) {
    recommendations.push(`Add ${workerGap} worker${workerGap === 1 ? '' : 's'} to hit the target duration.`);
  } else {
    recommendations.push('Current crew size can meet or exceed the target duration.');
  }
  if (weatherRisk !== 'low') {
    recommendations.push(`${riskLabels[weatherRisk]} weather risk detected. Protect material staging and sequence weather-sensitive tasks earlier.`);
  }
  if (complexityFactor > 1.15) {
    recommendations.push('Task complexity is elevated. Assign a foreman and inspect quality daily.');
  }
  if (overtimeHours > 0) {
    recommendations.push(`Overtime adds capacity but increases labor cost by about $${Math.round(overtimeCost).toLocaleString()}.`);
  }
  if (completionProbability < 75) {
    recommendations.push('Rebaseline the schedule or increase productivity assumptions before committing this plan.');
  }

  return {
    quantity,
    completedQuantity,
    remainingQuantity,
    bufferedQuantity,
    unit,
    requiredWorkers,
    plannedWorkers,
    currentWorkers,
    workerGap,
    dailyTarget,
    currentCapacityPerDay,
    plannedCapacityPerDay,
    estimatedDuration,
    estimatedDurationWithCurrentCrew,
    targetDays,
    targetFinishDate,
    forecastFinishDate,
    currentCrewFinishDate,
    laborRate,
    laborCost,
    regularLaborCost: Math.round(regularLaborCost),
    overtimeCost: Math.round(overtimeCost),
    overheadCost: Math.round(overheadCost),
    effectiveProductivity: Math.round(effectiveProductivity),
    completionProbability,
    riskLevel,
    recommendations,
    schedule,
  };
}
