// src/engine/units.ts
/**
 * Utility functions for unit conversions used in HepaTwin.
 */

/**
 * Convert platelets value to the base unit of 10^9/L.
 * The UI provides a selector with options:
 *   - "10^9/L" (already base)
 *   - "lakh/cumm" (1 lakh = 100 * 10^9/L)
 *   - "mm^3" (1 mm^3 = 10^6/L, i.e., 0.001 * 10^9/L)
 *
 * @param value The numeric platelets value entered by the user.
 * @param unit The unit string selected by the user.
 * @returns Platelets in 10^9/L.
 */
export function plateletsToBase(value: number, unit: string): number {
  switch (unit) {
    case "10^9/L":
      return value;
    case "lakh/cumm":
      // 1 lakh = 100 * 10^9/L
      return value * 100;
    case "mm^3":
      // 1 mm^3 = 10^6/L = 0.001 * 10^9/L
      return value * 0.001;
    default:
      // Unknown unit – fall back to base and let validation handle it.
      return value;
  }
}

/**
 * Simple range validator used by the entry form.
 * Returns true if the value is within plausible human limits.
 */
export function isReasonableNumber(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
