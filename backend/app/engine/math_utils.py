"""
app/engine/math_utils.py – Clinical score calculations (mirrors src/engine/math.ts)

FIB-4  = (Age × AST) / (Platelets × √ALT)
APRI   = ((AST / AST_ULN) / Platelets) × 100
"""
import math


def compute_fib4(age: float, ast: float, alt: float, platelets: float) -> float:
    """
    Compute FIB-4 score.

    Parameters
    ----------
    age       : patient age in years
    ast       : AST in U/L
    alt       : ALT in U/L  (must be > 0)
    platelets : platelets in 10⁹/L (must be > 0)

    Returns
    -------
    FIB-4 value (float)
    """
    safe_plt = max(platelets, 1.0)
    safe_alt = max(alt, 1.0)
    return (age * ast) / (safe_plt * math.sqrt(safe_alt))


def compute_apri(ast: float, platelets: float, ast_uln: float = 40.0) -> float:
    """
    Compute APRI score.

    Parameters
    ----------
    ast       : AST in U/L
    platelets : platelets in 10⁹/L
    ast_uln   : upper limit of normal for AST (default 40 U/L)

    Returns
    -------
    APRI value (float)
    """
    safe_plt = max(platelets, 1.0)
    ratio = ast / ast_uln
    return (ratio / safe_plt) * 100.0


def interpret_fib4(fib4: float, age: float) -> str:
    """Return 'low', 'indeterminate', or 'high' based on age-adjusted thresholds."""
    if age >= 65:
        low_threshold = 2.0
    else:
        low_threshold = 1.3
    if fib4 < low_threshold:
        return "low"
    if fib4 >= 2.67:
        return "high"
    return "indeterminate"


def interpret_apri(apri: float) -> str:
    if apri < 0.5:
        return "low"
    if apri > 1.5:
        return "high"
    return "indeterminate"
