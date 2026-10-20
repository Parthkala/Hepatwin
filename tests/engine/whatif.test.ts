// tests/engine/whatif.test.ts
import { expect, test } from "vitest";
import { runWhatIfScenario } from "../../src/engine/whatif";
import { computeDriverSlope } from "../../src/engine/whatif";
import { KalmanParams } from "../../src/engine/kalman";

const defaultParams: KalmanParams = {
  observationStd: 0.15,
  processStd: 0.006,
  initialLevelStd: 0.5,
  initialSlopeStd: 0.01,
};

function buildVisits(count: number): any[] {
  const visits = [];
  for (let i = 0; i < count; i++) {
    visits.push({
      month: i * 3,
      age: 48,
      ast: 96 - i * 2,
      alt: 58 + i * 2,
      platelets: 132 - i * 5,
    });
  }
  return visits;
}

test("what‑if scenario respects driver slope adjustments", () => {
  const visits = buildVisits(3);
  const driverValues = { alcohol_excess: 35, weight_loss: 5 };
  const scenario = runWhatIfScenario(visits, "Alcohol", driverValues);

  // The computed driver slope should be positive (excess alcohol) minus a small reduction from weight loss
  const driverSlope = computeDriverSlope("Alcohol", driverValues);
  expect(driverSlope).toBeGreaterThan(0);

  // Verify that the forecast mean rises compared to a baseline with no drivers (simple sanity check)
  const baseline = runWhatIfScenario(visits, "Alcohol", {});
  expect(scenario[11].mean).toBeGreaterThan(baseline[11].mean);
});
