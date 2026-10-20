"""
app/engine/kalman.py – Kalman filter + forecasting pipeline (mirrors kalman.ts)

State vector x = [level, slope]ᵀ where:
  level = ln(FIB-4)
  slope = monthly drift of log(FIB-4)

Observation model : y_obs = level + ε,   ε ~ N(0, σ_obs²)
State transition   : x_{t+dt} = A x_t + noise

Uses NumPy for clean matrix arithmetic.
SciPy is used only for the Gaussian CDF (crossing probability).
"""
from __future__ import annotations
from dataclasses import dataclass
import math

import numpy as np
from scipy.stats import norm  # type: ignore

from app.engine.math_utils import compute_fib4


# ─── Data structures ─────────────────────────────────────────────────────────

@dataclass
class Visit:
    month: int
    ast: float
    alt: float
    platelets: float


@dataclass
class KalmanParams:
    observation_std: float = 0.2
    process_std: float = 0.1
    initial_level_std: float = 1.0
    initial_slope_std: float = 0.5


@dataclass
class Posterior:
    mu: np.ndarray       # shape (2,) – [level, slope]
    sigma: np.ndarray    # shape (2, 2) – covariance


@dataclass
class ForecastPoint:
    month: int
    mean: float
    lower80: float
    upper80: float
    lower95: float
    upper95: float


# ─── Core Kalman functions ────────────────────────────────────────────────────

def run_kalman(
    visits: list[Visit],
    params: KalmanParams,
    age: float,
) -> Posterior:
    """
    Run the Kalman filter across a sequence of visits.

    Parameters
    ----------
    visits : ordered list of Visit objects (month ascending)
    params : Kalman hyper-parameters
    age    : patient age (constant – used for FIB-4 computation)

    Returns
    -------
    Posterior after the last observation.
    """
    if not visits:
        raise ValueError("At least one visit is required to initialise the filter.")

    # ── Initialise prior at first visit ──────────────────────────────────────
    first = visits[0]
    fib4_0 = compute_fib4(age, first.ast, first.alt, first.platelets)
    level_0 = math.log(max(fib4_0, 0.001))

    mu = np.array([level_0, 0.0])          # [level, slope]
    sigma = np.diag([
        params.initial_level_std ** 2,
        params.initial_slope_std ** 2,
    ])

    R = np.array([[params.observation_std ** 2]])  # observation noise (scalar wrapped)
    H = np.array([[1.0, 0.0]])                     # observation matrix

    for i in range(1, len(visits)):
        prev_visit = visits[i - 1]
        cur_visit = visits[i]
        dt = cur_visit.month - prev_visit.month  # months elapsed

        # State transition matrix
        A = np.array([[1.0, float(dt)], [0.0, 1.0]])
        # Process noise (only on slope)
        Q = np.array([[0.0, 0.0], [0.0, params.process_std ** 2]])

        # ── Predict ──────────────────────────────────────────────────────────
        mu = A @ mu
        sigma = A @ sigma @ A.T + Q

        # ── Update ───────────────────────────────────────────────────────────
        fib4_obs = compute_fib4(age, cur_visit.ast, cur_visit.alt, cur_visit.platelets)
        y = np.array([[math.log(max(fib4_obs, 0.001))]])

        S = H @ sigma @ H.T + R           # innovation variance (1×1)
        K = sigma @ H.T @ np.linalg.inv(S)  # Kalman gain (2×1)
        innovation = y - H @ mu.reshape(-1, 1)
        mu = mu + (K @ innovation).flatten()
        sigma = (np.eye(2) - K @ H) @ sigma

    return Posterior(mu=mu, sigma=sigma)


def forecast_months(
    posterior: Posterior,
    months_ahead: int,
    params: KalmanParams,
    driver_scale: float = 1.0,
) -> list[ForecastPoint]:
    """
    Propagate the posterior forward `months_ahead` months.

    Parameters
    ----------
    posterior     : result of run_kalman
    months_ahead  : how many monthly steps to forecast
    params        : Kalman hyper-parameters
    driver_scale  : multiplies the slope (> 1 = faster progression)

    Returns
    -------
    List of ForecastPoint (month 1 … months_ahead)
    """
    z80 = norm.ppf(0.90)   # 80 % two-sided CI
    z95 = norm.ppf(0.975)  # 95 % two-sided CI

    A = np.array([[1.0, 1.0], [0.0, 1.0]])   # one-month transition
    Q = np.array([[0.0, 0.0], [0.0, params.process_std ** 2]])

    mu = posterior.mu.copy()
    # Apply driver scale to the slope component
    mu[1] *= driver_scale
    sigma = posterior.sigma.copy()

    results: list[ForecastPoint] = []
    for m in range(1, months_ahead + 1):
        mu = A @ mu
        sigma = A @ sigma @ A.T + Q

        mean_log = mu[0]
        sd_log = math.sqrt(max(sigma[0, 0], 1e-10))

        results.append(ForecastPoint(
            month=m,
            mean=math.exp(mean_log),
            lower80=math.exp(mean_log - z80 * sd_log),
            upper80=math.exp(mean_log + z80 * sd_log),
            lower95=math.exp(mean_log - z95 * sd_log),
            upper95=math.exp(mean_log + z95 * sd_log),
        ))

    return results


def crossing_probability(
    posterior: Posterior,
    months_ahead: int,
    threshold: float,
    params: KalmanParams,
    driver_scale: float = 1.0,
) -> float:
    """
    P(FIB-4 > threshold) at the end of the forecast horizon.

    Uses the log-normal distribution of the final forecast point.
    """
    forecasts = forecast_months(posterior, months_ahead, params, driver_scale)
    last = forecasts[-1]
    mean_log = math.log(max(last.mean, 0.001))

    # Re-run to get final sigma (simple approximation: use current posterior sigma[0,0])
    A = np.array([[1.0, 1.0], [0.0, 1.0]])
    Q = np.array([[0.0, 0.0], [0.0, params.process_std ** 2]])
    sigma_fwd = posterior.sigma.copy()
    for _ in range(months_ahead):
        sigma_fwd = A @ sigma_fwd @ A.T + Q

    sd_log = math.sqrt(max(sigma_fwd[0, 0], 1e-10))
    z = (math.log(threshold) - mean_log) / sd_log
    return float(1.0 - norm.cdf(z))
