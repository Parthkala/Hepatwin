// src/engine/math.ts
/**
 * Clinical score calculations for HepaTwin.
 * Implements FIB-4 and APRI formulas with safety checks.
 */

/**
 * Compute the FIB-4 score.
 *
 * Formula: (Age * AST) / (Platelets * sqrt(ALT))
 * Uses safe guards: Platelets and ALT are forced to be at least 1 to avoid division by zero.
 *
 * @param age Age in years.
 * @param ast AST value (U/L).
 * @param alt ALT value (U/L).
 * @param platelets Platelets in 10^9/L (already converted to base unit).
 * @returns FIB-4 score (number).
 */
export function computeFIB4(
  age: number,
  ast: number,
  alt: number,
  platelets: number,
): number {
  const safePlatelets = Math.max(platelets, 1);
  const safeALT = Math.max(alt, 1);
  const numerator = age * ast;
  const denominator = safePlatelets * Math.sqrt(safeALT);
  return numerator / denominator;
}

/**
 * Compute the APRI score.
 *
 * Formula: ((AST / AST_ULN) / Platelets) * 100
 * Uses AST_ULN = 40 U/L by default (configurable via parameter).
 * Safe guards: Platelets forced to be at least 1.
 *
 * @param ast AST value (U/L).
 * @param platelets Platelets in 10^9/L (already base).
 * @param astUln Upper limit of normal for AST (default 40).
 * @returns APRI score (number).
 */
export function computeAPRI(
  ast: number,
  platelets: number,
  astUln: number = 40,
): number {
  const safePlatelets = Math.max(platelets, 1);
  const ratio = ast / astUln;
  return (ratio / safePlatelets) * 100;
}

/**
 * Helper to interpret FIB-4 risk categories.
 * Returns "low", "indeterminate", or "high".
 */
export function interpretFIB4(fib4: number, age: number): string {
  if (age >= 65) {
    if (fib4 < 2.0) return "low";
  } else {
    if (fib4 < 1.3) return "low";
  }
  if (fib4 >= 2.67) return "high";
  return "indeterminate";
}

/**
 * Helper to interpret APRI risk categories.
 */
export function interpretAPRI(apri: number): string {
  if (apri < 0.5) return "low";
  if (apri > 1.5) return "high";
  return "indeterminate";
}
