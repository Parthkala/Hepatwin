"""
app/main.py – FastAPI application factory
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_tables
from app.routers.auth_router import router as auth_router
from app.routers.patient_router import router as patient_router
from app.routers.visit_router import router as visit_router
from app.routers.twin_router import router as twin_router


# ─── Lifespan (startup / shutdown) ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on first startup (idempotent)
    await create_tables()
    yield


# ─── App factory ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="HepaTwin API",
    description=(
        "Digital-twin backend for liver-fibrosis tracking.\n\n"
        "Core pipeline: FIB-4 scoring → Kalman filter → 12-month forecast → "
        "traffic-light risk indicator → what-if scenario analysis."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(visit_router)
app.include_router(twin_router)


# ─── Health check ────────────────────────────────────────────────────────────

@app.get("/health", tags=["infra"])
async def health():
    return {"status": "ok", "service": "hepatwin-backend"}
