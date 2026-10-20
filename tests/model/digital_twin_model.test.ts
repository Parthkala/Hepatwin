// tests/model/digital_twin_model.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useTwinStore } from "../../src/store/twinStore";
import { SYNTHETIC_PERSONAS } from "../../src/data/personas";

describe("Clinical Fibrosis Model & Store", () => {
  beforeEach(() => {
    useTwinStore.getState().selectPersona(SYNTHETIC_PERSONAS[0].id);
  });

  it("correctly evaluates FIB-4 and APRI indices for stable HBV patient (Aakash)", () => {
    const store = useTwinStore.getState();
    store.selectPersona(SYNTHETIC_PERSONAS[0].id);
    const metrics = store.getFibrosisMetrics();

    expect(metrics.fib4).toBeGreaterThan(0.5);
    expect(metrics.fib4).toBeLessThan(1.5);
    expect(metrics.metavirStage).toBe("F0");
    expect(metrics.overallRiskLevel).toBe("normal");
    expect(metrics.homeostaticReserveIndex).toBeGreaterThan(80);
  });

  it("correctly flags high risk and bridging fibrosis for NASH overlap patient (Vikram)", () => {
    const store = useTwinStore.getState();
    store.selectPersona(SYNTHETIC_PERSONAS[2].id);
    const metrics = store.getFibrosisMetrics();

    expect(metrics.fib4).toBeGreaterThan(3.25);
    expect(metrics.metavirStage).toBe("F3");
    expect(metrics.overallRiskLevel).toBe("critical");
    expect(metrics.homeostaticReserveIndex).toBeLessThan(75);
  });
});

describe("Dynamic Trajectory & Counterfactual Simulator", () => {
  it("projects higher annual drift with sleep deprivation and binge eating", () => {
    const store = useTwinStore.getState();
    store.selectPersona(SYNTHETIC_PERSONAS[0].id);
    
    // Baseline trajectory
    const baseTraj = store.getTrajectory();
    
    // Modify with sleep deprivation & binge eating
    store.updateWhatIf({
      sleepHoursPerDay: 4.5,
      bingeEatingHabit: true,
      alcoholUnitsPerWeek: 20,
    });
    
    const modTraj = store.getTrajectory();
    expect(modTraj.points[5].projectedScore).toBeGreaterThan(baseTraj.points[5].projectedScore);
  });

  it("generates 60-month trajectory with widening Bayesian confidence bands", () => {
    const store = useTwinStore.getState();
    store.selectPersona(SYNTHETIC_PERSONAS[1].id);
    const traj = store.getTrajectory();

    expect(traj.points.length).toBe(6);
    expect(traj.points[0].month).toBe(0);
    expect(traj.points[5].month).toBe(60);

    // Confidence interval spread at month 60 should be strictly wider than month 12
    const spreadM12 = traj.points[1].ci95Upper - traj.points[1].ci95Lower;
    const spreadM60 = traj.points[5].ci95Upper - traj.points[5].ci95Lower;
    expect(spreadM60).toBeGreaterThan(spreadM12);
  });
});

describe("TreeSHAP Explainable AI Attribution", () => {
  it("identifies top risk factors for non-adherent, sleep-deprived patient", () => {
    const store = useTwinStore.getState();
    store.selectPersona(SYNTHETIC_PERSONAS[1].id);
    store.updateWhatIf({
      antiviralAdherencePercent: 50,
      sleepHoursPerDay: 4,
    });

    const attribution = store.getFeatureAttribution();
    expect(attribution.drivers.length).toBeGreaterThanOrEqual(4);
    const acceleratingDrivers = attribution.drivers.filter(d => d.direction === "accelerating");
    expect(acceleratingDrivers.length).toBeGreaterThan(0);
    expect(attribution.topDriverSentence).toBeTruthy();
  });
});
