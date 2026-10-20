// src/model/explainability.ts
/**
 * Explainability Driver Model (SHAP-style Feature Attribution)
 * Computes individual risk contributions (both positive/protective and negative/accelerating)
 * for the patient's lifestyle, viral load, and metabolic parameters.
 *
 * Proof of concept for decision support. Not a medical device.
 */

import { WhatIfParameters } from '../../scripts/generate-synthetic';

export interface DriverContribution {
  featureKey: string;
  featureLabel: string;
  valueDisplay: string;
  shapScore: number; // Positive = accelerates risk/fibrosis, Negative = protective
  percentage: number; // Share of total directional force
  direction: 'accelerating' | 'protective';
  clinicalDetail: string;
}

export function computeFeatureAttribution(
  params: WhatIfParameters,
  baselineFib4: number,
  viralLoad: number
): { drivers: DriverContribution[]; topDriverSentence: string } {
  const drivers: DriverContribution[] = [];

  // 1. Alcohol
  const alcoholShap = params.alcoholUnitsPerWeek > 14
    ? (params.alcoholUnitsPerWeek - 14) * 0.12 + 0.95
    : params.alcoholUnitsPerWeek > 0
    ? params.alcoholUnitsPerWeek * 0.08
    : -0.35;
  drivers.push({
    featureKey: 'alcohol',
    featureLabel: 'Alcohol Consumption',
    valueDisplay: `${params.alcoholUnitsPerWeek} units/wk`,
    shapScore: Number(alcoholShap.toFixed(2)),
    percentage: 0,
    direction: alcoholShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: alcoholShap > 0
      ? 'Acetaldehyde toxicity exacerbates stellate cell fibrogenesis.'
      : 'Complete abstinence halts alcohol-induced hepatocellular stress.',
  });

  // 2. Antiviral Adherence
  const adherenceShap = params.antiviralAdherencePercent >= 90
    ? -0.85
    : params.antiviralAdherencePercent >= 70
    ? -0.25
    : (1 - params.antiviralAdherencePercent / 100) * 1.10;
  drivers.push({
    featureKey: 'adherence',
    featureLabel: 'Antiviral Adherence',
    valueDisplay: `${params.antiviralAdherencePercent}%`,
    shapScore: Number(adherenceShap.toFixed(2)),
    percentage: 0,
    direction: adherenceShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: adherenceShap > 0
      ? 'Intermittent dosing allows viral breakthrough replication.'
      : 'Sustained virologic suppression induces histological regression.',
  });

  // 3. BMI & Metabolic Load
  const bmiShap = params.bmi >= 30
    ? (params.bmi - 25) * 0.08
    : params.bmi > 25
    ? (params.bmi - 25) * 0.04
    : -0.22;
  drivers.push({
    featureKey: 'bmi',
    featureLabel: 'BMI / Metabolic Adiposity',
    valueDisplay: `${params.bmi} kg/m²`,
    shapScore: Number(bmiShap.toFixed(2)),
    percentage: 0,
    direction: bmiShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: bmiShap > 0
      ? 'Hepatic steatosis provokes chronic lipotoxicity.'
      : 'Normal BMI prevents secondary steatohepatitis.',
  });

  // 4. Physical Exercise
  const exerciseShap = params.weeklyExerciseMinutes >= 150
    ? -0.45
    : params.weeklyExerciseMinutes < 60
    ? 0.35
    : -0.10;
  drivers.push({
    featureKey: 'exercise',
    featureLabel: 'Weekly Physical Activity',
    valueDisplay: `${params.weeklyExerciseMinutes} mins/wk`,
    shapScore: Number(exerciseShap.toFixed(2)),
    percentage: 0,
    direction: exerciseShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: exerciseShap > 0
      ? 'Sedentary state worsens peripheral insulin resistance.'
      : 'Meets WHO guideline for peripheral insulin sensitivity.',
  });

  // 5. Diet Quality
  const dietShap = params.dietQualityScore >= 75
    ? -0.38
    : params.dietQualityScore < 40
    ? 0.42
    : 0.0;
  drivers.push({
    featureKey: 'diet',
    featureLabel: 'Dietary Inflammatory Score',
    valueDisplay: `${params.dietQualityScore}/100`,
    shapScore: Number(dietShap.toFixed(2)),
    percentage: 0,
    direction: dietShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: dietShap > 0
      ? 'High refined-carbohydrate / ultra-processed fat diet.'
      : 'High antioxidant & dietary fiber intake preserves microvasculature.',
  });

  // 6. Viral Replication Burden
  const viralShap = viralLoad > 20000 ? 0.75 : viralLoad > 200 ? 0.25 : -0.30;
  drivers.push({
    featureKey: 'viral_burden',
    featureLabel: 'Circulating Viral Burden',
    valueDisplay: `${viralLoad.toLocaleString()} IU/mL`,
    shapScore: Number(viralShap.toFixed(2)),
    percentage: 0,
    direction: viralShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: viralShap > 0
      ? 'Active antigenemia sustaining cytotoxic T-cell hepatocyte destruction.'
      : 'Suppressed viral replication minimizing necroinflammation.',
  });

  // 7. Sleep Duration & Circadian Recovery
  const sleepHrs = params.sleepHoursPerDay || 7;
  const sleepShap = sleepHrs < 6
    ? (6 - sleepHrs) * 0.28 + 0.25
    : sleepHrs >= 7 && sleepHrs <= 8.5
    ? -0.32
    : 0.0;
  drivers.push({
    featureKey: 'sleep',
    featureLabel: 'Sleep & Circadian Rhythm',
    valueDisplay: `${sleepHrs} hrs/night`,
    shapScore: Number(sleepShap.toFixed(2)),
    percentage: 0,
    direction: sleepShap > 0 ? 'accelerating' : 'protective',
    clinicalDetail: sleepShap > 0
      ? 'Sleep deprivation (<6h) disrupts Rev-ErbA circadian clock genes, promoting hepatic steatosis.'
      : '7+ hours of sleep optimizes nighttime hepatic glycogen and cellular repair.',
  });

  // 8. Binge Eating & Steatosis
  if (params.bingeEatingHabit === 'frequent') {
    drivers.push({
      featureKey: 'binge_eating',
      featureLabel: 'Binge Eating Tendency',
      valueDisplay: 'Frequent (>3x/wk)',
      shapScore: 0.82,
      percentage: 0,
      direction: 'accelerating',
      clinicalDetail: 'Late-night high-glycemic spikes overload de novo lipogenesis, driving fatty liver.',
    });
  } else if (params.bingeEatingHabit === 'occasional') {
    drivers.push({
      featureKey: 'binge_eating',
      featureLabel: 'Binge Eating Tendency',
      valueDisplay: 'Occasional (1-2x/wk)',
      shapScore: 0.28,
      percentage: 0,
      direction: 'accelerating',
      clinicalDetail: 'Occasional heavy meals create intermittent metabolic strain.',
    });
  }

  // 9. Comorbid Diabetes
  if (params.hasDiabetesHistory) {
    drivers.push({
      featureKey: 'diabetes',
      featureLabel: 'Type 2 Diabetes',
      valueDisplay: 'Active Comorbidity',
      shapScore: 0.68,
      percentage: 0,
      direction: 'accelerating',
      clinicalDetail: 'Insulin resistance increases free fatty acid influx into the liver, accelerating fibrogenesis.',
    });
  }

  // Calculate percentages based on absolute magnitudes
  const totalMagnitude = drivers.reduce((acc, d) => acc + Math.abs(d.shapScore), 0);
  drivers.forEach((d) => {
    d.percentage = Math.round((Math.abs(d.shapScore) / (totalMagnitude || 1)) * 100);
  });

  // Sort by highest absolute impact first
  drivers.sort((a, b) => Math.abs(b.shapScore) - Math.abs(a.shapScore));

  // Generate plain-language sentence
  const topAccelerating = drivers.find((d) => d.direction === 'accelerating');
  const topProtective = drivers.find((d) => d.direction === 'protective');

  let topDriverSentence = '';
  if (topAccelerating && Math.abs(topAccelerating.shapScore) > 0.4) {
    topDriverSentence = `${topAccelerating.featureLabel} is adding the most to projected fibrosis progression.`;
  } else if (topProtective) {
    topDriverSentence = `${topProtective.featureLabel} is the strongest factor shielding the liver from progression.`;
  } else {
    topDriverSentence = 'Risk drivers are currently balanced with low ongoing fibrogenic activity.';
  }

  return {
    drivers,
    topDriverSentence,
  };
}
