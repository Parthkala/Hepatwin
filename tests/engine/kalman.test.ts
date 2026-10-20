// tests/engine/kalman.test.ts
import { describe, it, expect } from 'vitest';
import { runKalman, forecastMonths, crossingProbability } from '../../src/engine/kalman';
import type { KalmanParams, Visit } from '../../src/engine/kalman';

// Helper to generate simple visits
function makeVisits(count: number): Visit[] {
  const visits: Visit[] = [];
  for (let i = 0; i < count; i++) {
    visits.push({
      month: i, // monthly intervals
      age: 50 + i,
      ast: 30 + i * 2,
      alt: 25 + i * 2,
      platelets: 200, // constant, already in 10⁹/L
    });
  }
  return visits;
}

const defaultParams: KalmanParams = {
  observationStd: 0.2,
  processStd: 0.1,
  initialLevelStd: 1.0,
  initialSlopeStd: 0.5,
};

describe('Kalman engine', () => {
  it('reduces posterior variance with more observations', () => {
    const twoVisits = runKalman(makeVisits(2), defaultParams);
    const threeVisits = runKalman(makeVisits(3), defaultParams);
    const varTwo = twoVisits.Sigma[0][0];
    const varThree = threeVisits.Sigma[0][0];
    // Expect variance after three visits to be smaller than after two visits
    expect(varThree).toBeLessThan(varTwo);
  });

  it('crossing probability stays within [0, 1]', () => {
    const posterior = runKalman(makeVisits(4), defaultParams);
    const prob = crossingProbability(posterior, 6, 3.0, defaultParams);
    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(1);
  });

  it('forecastMonths returns sensible positive values', () => {
    const posterior = runKalman(makeVisits(3), defaultParams);
    const forecasts = forecastMonths(posterior, 5, defaultParams);
    expect(forecasts).toHaveLength(5);
    for (const f of forecasts) {
      expect(f.mean).toBeGreaterThan(0);
      expect(f.lower80).toBeGreaterThan(0);
      expect(f.upper80).toBeGreaterThan(f.lower80);
    }
  });
});
