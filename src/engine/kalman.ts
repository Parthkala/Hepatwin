// src/engine/kalman.ts
/**
 * Minimal Kalman filter implementation for HepaTwin.
 *
 * State vector x = [level, slope]ᵀ where:
 *   - level = ln(FIB‑4)
 *   - slope = monthly drift of level
 *
 * Observation model: y_obs = level + ε,   ε ~ N(0, σ_obs²)
 * State transition (Δt months):
 *   level_{t+Δt} = level_t + slope_t * Δt
 *   slope_{t+Δt} = slope_t + η,   η ~ N(0, σ_process²)
 */

import { computeFIB4 } from "./math";
import { plateletsToBase } from "./units";

export interface KalmanParams {
  observationStd: number; // σ_obs
  processStd: number; // σ_process
  initialLevelStd: number; // uncertainty on initial level
  initialSlopeStd: number; // uncertainty on initial slope
}

export interface Visit {
  month: number; // months since first visit (can be irregular)
  age: number;
  ast: number;
  alt: number;
  platelets: number; // already converted to 10⁹/L
}

/**
 * Run the Kalman filter on a series of visits.
 * Returns posterior state mean & covariance after the last observation.
 */
export function runKalman(visits: Visit[], params: KalmanParams) {
  // Initial prior at month 0 (first visit)
  const first = visits[0];
  const fib4 = computeFIB4(first.age, first.ast, first.alt, first.platelets);
  const level0 = Math.log(Math.max(fib4, 0.001));
  const slope0 = 0; // prior mean; will be overridden by driver effects later

  // State mean vector
  let mu = [level0, slope0];
  // Covariance matrix 2x2
  let Sigma = [
    [params.initialLevelStd ** 2, 0],
    [0, params.initialSlopeStd ** 2],
  ];

  const R = params.observationStd ** 2; // observation variance

  for (let i = 1; i < visits.length; i++) {
    const prev = visits[i - 1];
    const cur = visits[i];
    const dt = cur.month - prev.month; // months elapsed
    // ---- Predict step ----
    const A = [
      [1, dt],
      [0, 1],
    ]; // state transition matrix
    const Q = [
      [0, 0],
      [0, params.processStd ** 2],
    ]; // process noise (only on slope)

    // mu = A * mu
    mu = [A[0][0] * mu[0] + A[0][1] * mu[1], A[1][0] * mu[0] + A[1][1] * mu[1]];
    // Sigma = A * Sigma * Aᵀ + Q
    const AT = [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
    const ASigma = [
      [A[0][0] * Sigma[0][0] + A[0][1] * Sigma[1][0], A[0][0] * Sigma[0][1] + A[0][1] * Sigma[1][1]],
      [A[1][0] * Sigma[0][0] + A[1][1] * Sigma[1][0], A[1][0] * Sigma[0][1] + A[1][1] * Sigma[1][1]],
    ];
    Sigma = [
      [ASigma[0][0] * AT[0][0] + ASigma[0][1] * AT[1][0] + Q[0][0], ASigma[0][0] * AT[0][1] + ASigma[0][1] * AT[1][1] + Q[0][1]],
      [ASigma[1][0] * AT[0][0] + ASigma[1][1] * AT[1][0] + Q[1][0], ASigma[1][0] * AT[0][1] + ASigma[1][1] * AT[1][1] + Q[1][1]],
    ];

    // ---- Update step with observation ----
    const obsFib4 = computeFIB4(cur.age, cur.ast, cur.alt, cur.platelets);
    const y = Math.log(Math.max(obsFib4, 0.001));
    const H = [1, 0]; // observation matrix
    // Innovation
    const innovation = y - (H[0] * mu[0] + H[1] * mu[1]);
    // Innovation variance
    const S = H[0] * (Sigma[0][0] * H[0] + Sigma[0][1] * H[1]) + H[1] * (Sigma[1][0] * H[0] + Sigma[1][1] * H[1]) + R;
    // Kalman gain (2x1)
    const K = [ (Sigma[0][0] * H[0] + Sigma[0][1] * H[1]) / S, (Sigma[1][0] * H[0] + Sigma[1][1] * H[1]) / S ];
    // Update state
    mu = [ mu[0] + K[0] * innovation, mu[1] + K[1] * innovation ];
    // Update covariance: Sigma = (I - K H) Sigma
    const KH = [
      [K[0] * H[0], K[0] * H[1]],
      [K[1] * H[0], K[1] * H[1]],
    ];
    Sigma = [
      [ (1 - KH[0][0]) * Sigma[0][0] - KH[0][1] * Sigma[1][0], (1 - KH[0][0]) * Sigma[0][1] - KH[0][1] * Sigma[1][1] ],
      [ -KH[1][0] * Sigma[0][0] + (1 - KH[1][1]) * Sigma[1][0], -KH[1][0] * Sigma[0][1] + (1 - KH[1][1]) * Sigma[1][1] ],
    ];
  }

  return { mu, Sigma };
}

/**
 * Forecast the next `monthsAhead` months after the last observation.
 * Returns arrays of mean FIB‑4 values and 80 % / 95 % confidence bands.
 */
export function forecastMonths(
  posterior: { mu: number[]; Sigma: number[][] },
  monthsAhead: number,
  params: KalmanParams,
) {
  const results: { month: number; mean: number; lower80: number; upper80: number; lower95: number; upper95: number }[] = [];
  let mu = posterior.mu.slice();
  let Sigma = posterior.Sigma.map(row => row.slice());

  const z80 = 1.2815515655446004; // 90th percentile (two‑sided 80% CI)
  const z95 = 1.959963984540054; // 95% two‑sided

  for (let m = 1; m <= monthsAhead; m++) {
    // Predict one month forward (Δt = 1)
    const A = [
      [1, 1],
      [0, 1],
    ];
    const Q = [
      [0, 0],
      [0, params.processStd ** 2],
    ];
    // mu = A * mu
    mu = [mu[0] + mu[1], mu[1]];
    // Sigma = A * Sigma * Aᵀ + Q (simple manual for 2x2)
    const newSigma = [
      [
        Sigma[0][0] + 2 * Sigma[0][1] + Sigma[1][1] + Q[0][0],
        Sigma[0][1] + Sigma[1][1] + Q[0][1],
      ],
      [
        Sigma[0][1] + Sigma[1][1] + Q[1][0],
        Sigma[1][1] + Q[1][1],
      ],
    ];
    Sigma = newSigma;

    const meanLog = mu[0];
    const varLog = Sigma[0][0];
    const sdLog = Math.sqrt(varLog);
    const lower80 = Math.exp(meanLog - z80 * sdLog);
    const upper80 = Math.exp(meanLog + z80 * sdLog);
    const lower95 = Math.exp(meanLog - z95 * sdLog);
    const upper95 = Math.exp(meanLog + z95 * sdLog);
    results.push({ month: m, mean: Math.exp(meanLog), lower80, upper80, lower95, upper95 });
  }
  return results;
}

/**
 * Compute the probability that FIB‑4 at a specific future month exceeds a threshold.
 * Uses the Gaussian distribution on the log scale.
 */
export function crossingProbability(
  posterior: { mu: number[]; Sigma: number[][] },
  monthsAhead: number,
  threshold: number,
  params: KalmanParams,
): number {
  // Forecast to the target month
  const forecasts = forecastMonths(posterior, monthsAhead, params);
  const last = forecasts[forecasts.length - 1];
  const meanLog = Math.log(last.mean);
  const varLog = posterior.Sigma[0][0]; // approximation: use current variance
  const sdLog = Math.sqrt(varLog);
  const z = (Math.log(threshold) - meanLog) / sdLog;
  // 1 - Φ(z)
  const phi = 0.5 * (1 + erf(z / Math.SQRT2));
  return 1 - phi;
}

// Error function approximation (Abramowitz & Stegun)
function erf(x: number): number {
  const sign = Math.sign(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
