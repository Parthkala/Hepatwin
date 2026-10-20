// src/engine/whatif.ts
import { runKalman, forecastMonths, KalmanParams, Visit } from "./kalman";

const defaultKalmanParams: KalmanParams = {
  observationStd: 0.15,
  processStd: 0.006,
  initialLevelStd: 0.5,
  initialSlopeStd: 0.01,
};

export const BASELINE_ETIOLOGY_SLOPES: Record<string, number> = {
  Alcohol: 0.005,
  HCV: 0.003,
  HBV: 0.002,
  NASH: 0.004,
  Default: 0.003,
};

/**
 * Computes monthly drift adjustment based on clinical lifestyle/medication drivers.
 */
export function computeDriverSlope(
  etiology: string,
  driverValues: Record<string, number> = {}
): number {
  let slope = BASELINE_ETIOLOGY_SLOPES[etiology] ?? BASELINE_ETIOLOGY_SLOPES.Default;

  if (driverValues.alcohol_excess !== undefined) {
    slope += Math.max(0, driverValues.alcohol_excess) * 0.0015;
  }
  if (driverValues.weight_loss !== undefined) {
    slope -= Math.max(0, driverValues.weight_loss) * 0.0008;
  }
  if (driverValues.antiviral_adherence !== undefined) {
    if (driverValues.antiviral_adherence >= 80) {
      slope -= 0.004;
    } else {
      slope += 0.003;
    }
  }
  if (driverValues.sleep_deprivation !== undefined) {
    slope += Math.max(0, driverValues.sleep_deprivation) * 0.001;
  }

  return slope;
}

/**
 * Runs a Kalman-based counterfactual what-if simulation given patient visit history.
 */
export function runWhatIfScenario(
  visits: Visit[],
  etiology: string,
  driverValues: Record<string, number> = {},
  monthsAhead: number = 12,
  params: KalmanParams = defaultKalmanParams
) {
  const posterior = runKalman(visits, params);
  const driverSlope = computeDriverSlope(etiology, driverValues);

  // Apply counterfactual driver slope to state
  const modifiedPosterior = {
    mu: [posterior.mu[0], posterior.mu[1] + driverSlope],
    Sigma: posterior.Sigma.map((row) => row.slice()),
  };

  return forecastMonths(modifiedPosterior, monthsAhead, params);
}
