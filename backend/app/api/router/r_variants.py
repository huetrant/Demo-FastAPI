import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    Variant,
    VariantCreate,
    VariantUpdate,
    VariantPublic,
    VariantsPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_variant import (
    create_variant as crud_create_variant,
    update_variant as crud_update_variant,
    get_variant as crud_get_variant,
    get_variants as crud_get_variants,
    delete_variant as crud_delete_variant,
)

router = APIRouter(prefix="/variants", tags=["variants"])

@router.get("/", response_model=VariantsPublic)
def read_variants(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    variants, count = crud_get_variants(session=session, skip=skip, limit=limit)
    data = [VariantPublic.model_validate(var) for var in variants]
    return VariantsPublic(data=data, count=count)

@router.get("/{id}", response_model=VariantPublic)
def read_variant(
    id: uuid.UUID, session: SessionDep
) -> Any:
    variant = crud_get_variant(session=session, id=id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    return VariantPublic.model_validate(variant)

@router.post("/", response_model=VariantPublic)
def create_variant(
    variant_in: VariantCreate, session: SessionDep
) -> Any:
    variant = crud_create_variant(session=session, variant_create=variant_in)
    return VariantPublic.model_validate(variant)

@router.put("/{id}", response_model=VariantPublic)
def update_variant(
    id: uuid.UUID, variant_in: VariantUpdate, session: SessionDep
) -> Any:
    variant = crud_get_variant(session=session, id=id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    variant = crud_update_variant(session=session, db_variant=variant, variant_in=variant_in)
    return VariantPublic.model_validate(variant)

@router.delete("/{id}")
def delete_variant(
    id: uuid.UUID, session: SessionDep
):
    variant = crud_get_variant(session=session, id=id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    crud_delete_variant(session=session, variant=variant)
    return {"message": "Variant deleted successfully"}