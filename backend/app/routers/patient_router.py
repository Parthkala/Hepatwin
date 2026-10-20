"""
app/routers/patient_router.py – /patients CRUD endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import orm, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/", response_model=list[schemas.PatientOut])
async def list_patients(
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """List all patients owned by the current clinician."""
    result = await db.execute(
        select(orm.Patient).where(orm.Patient.owner_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=schemas.PatientOut, status_code=201)
async def create_patient(
    patient_in: schemas.PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Register a new patient."""
    patient = orm.Patient(**patient_in.model_dump(), owner_id=current_user.id)
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=schemas.PatientOut)
async def get_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Get a single patient by ID."""
    patient = await _get_owned_patient(patient_id, current_user.id, db)
    return patient


@router.patch("/{patient_id}", response_model=schemas.PatientOut)
async def update_patient(
    patient_id: str,
    updates: schemas.PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Partially update patient details."""
    patient = await _get_owned_patient(patient_id, current_user.id, db)
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: orm.User = Depends(get_current_user),
):
    """Delete a patient and all their visits."""
    patient = await _get_owned_patient(patient_id, current_user.id, db)
    await db.delete(patient)
    await db.commit()


# ─── helper ──────────────────────────────────────────────────────────────────

async def _get_owned_patient(
    patient_id: str, owner_id: str, db: AsyncSession
) -> orm.Patient:
    result = await db.execute(
        select(orm.Patient).where(
            orm.Patient.id == patient_id,
            orm.Patient.owner_id == owner_id,
        )
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
