// tests/engine/math.test.ts
import { expect, test } from 'vitest';
import { computeFIB4, computeAPRI } from '../../src/engine/math';
import { plateletsToBase } from '../../src/engine/units';

// Helper to compare floating numbers within tolerance
function closeTo(actual: number, expected: number, tolerance: number = 0.001) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

test('FIB-4 calculation matches reference values', () => {
  // Example 1: Age 50, AST 60, ALT 80, Platelets 150 (10^9/L)
  const fib1 = computeFIB4(50, 60, 80, 150);
  closeTo(fib1, 2.236);

  // Example 2: Age 36, AST 44, ALT 52, Platelets 210
  const fib2 = computeFIB4(36, 44, 52, 210);
  closeTo(fib2, 1.046);
});

test('APRI calculation matches reference values', () => {
  // Example 1 values lead to APRI = 1.0
  const apri1 = computeAPRI(60, 150); // AST 60, platelets 150
  closeTo(apri1, 1.0);
});
