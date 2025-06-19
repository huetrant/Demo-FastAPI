import uuid
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
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
    search_variants as crud_search_variants,
)

router = APIRouter(prefix="/variants", tags=["variants"])

@router.get("/", response_model=VariantsPublic)
def read_variants(
    session: SessionDep,
    skip: int = 0,
    limit: int | None = Query(default=None, ge=1),
    product_id: uuid.UUID | None = Query(default=None)
) -> Any:
    variants, count = crud_get_variants(session=session, skip=skip, limit=limit, product_id=product_id)
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

@router.get("/search", response_model=VariantsPublic)
def search_variants(
    session: SessionDep,
    q: str = Query("", description="Từ khóa tìm kiếm (beverage_option)"),
    skip: int = Query(0, ge=0, description="Số bản ghi bỏ qua"),
    limit: int = Query(100, ge=1, le=1000, description="Số bản ghi tối đa"),
    product_id: Optional[uuid.UUID] = Query(None, description="Lọc theo sản phẩm"),
    min_price: Optional[float] = Query(None, ge=0, description="Giá tối thiểu"),
    max_price: Optional[float] = Query(None, ge=0, description="Giá tối đa")
) -> Any:
    """
    Tìm kiếm variant theo beverage_option và các tiêu chí khác
    """
    variants, count = crud_search_variants(
        session=session, 
        query=q, 
        skip=skip, 
        limit=limit,
        product_id=product_id,
        min_price=min_price,
        max_price=max_price
    )
    data = [VariantPublic.model_validate(var) for var in variants]
    return VariantsPublic(data=data, count=count)