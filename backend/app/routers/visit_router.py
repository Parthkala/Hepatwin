"""
app/routers/visit_router.py – /patients/{patient_id}/visits CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import orm, schemas
from app.auth import get_current_user

router = APIRouter(tags=["visits"])


@router.get("/patients/{patient_id}/visits", response_model=list[schemas.VisitOut])
async def list_visits(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Return all visits for a patient (ordered by month)."""
    await _assert_ownership(patient_id, current_user.id, db)
    result = await db.execute(
        select(orm.Visit)
        .where(orm.Visit.patient_id == patient_id)
        .order_by(orm.Visit.month)
    )
    return result.scalars().all()


@router.post("/patients/{patient_id}/visits", response_model=schemas.VisitOut, status_code=201)
async def add_visit(
    patient_id: str,
    visit_in: schemas.VisitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Add a new clinical visit to a patient."""
    await _assert_ownership(patient_id, current_user.id, db)

    # Prevent duplicate month
    dup = await db.execute(
        select(orm.Visit).where(
            orm.Visit.patient_id == patient_id,
            orm.Visit.month == visit_in.month,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"A visit at month {visit_in.month} already exists for this patient.",
        )

    visit = orm.Visit(patient_id=patient_id, **visit_in.model_dump())
    db.add(visit)
    await db.commit()
    await db.refresh(visit)
    return visit


@router.delete("/patients/{patient_id}/visits/{visit_id}", status_code=204)
async def delete_visit(
    patient_id: str,
    visit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Delete a single visit record."""
    await _assert_ownership(patient_id, current_user.id, db)
    result = await db.execute(
        select(orm.Visit).where(
            orm.Visit.id == visit_id,
            orm.Visit.patient_id == patient_id,
        )
    )
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    await db.delete(visit)
    await db.commit()


# ─── helper ──────────────────────────────────────────────────────────────────

async def _assert_ownership(patient_id: str, owner_id: str, db: AsyncSession):
    result = await db.execute(
        select(orm.Patient).where(
            orm.Patient.id == patient_id,
            orm.Patient.owner_id == owner_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Patient not found")
