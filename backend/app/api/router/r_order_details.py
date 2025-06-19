import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    OrderDetail,
    OrderDetailCreate,
    OrderDetailUpdate,
    OrderDetailPublic,
    OrderDetailsPublic,
    OrderDetailWithVariantPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_order_detail import (
    create_order_detail as crud_create_order_detail,
    update_order_detail as crud_update_order_detail,
    get_order_detail as crud_get_order_detail,
    get_order_details as crud_get_order_details,
    delete_order_detail as crud_delete_order_detail,
)

router = APIRouter(prefix="/order_details", tags=["order_details"])

@router.get("/", response_model=OrderDetailsPublic)
def read_order_details(
    session: SessionDep, skip: int = 0, limit: int = 100, order_id: uuid.UUID = None
) -> Any:
    order_details, count = crud_get_order_details(session=session, skip=skip, limit=limit, order_id=order_id)
    data = [OrderDetailWithVariantPublic.model_validate(od) for od in order_details]
    return OrderDetailsPublic(data=data, count=count)

@router.get("/{id}", response_model=OrderDetailPublic)
def read_order_detail(
    id: uuid.UUID, session: SessionDep
) -> Any:
    order_detail = crud_get_order_detail(session=session, id=id)
    if not order_detail:
        raise HTTPException(status_code=404, detail="OrderDetail not found")
    return OrderDetailWithVariantPublic.model_validate(order_detail)

@router.post("/", response_model=OrderDetailPublic)
def create_order_detail(
    order_detail_in: OrderDetailCreate, session: SessionDep
) -> Any:
    order_detail = crud_create_order_detail(session=session, order_detail_create=order_detail_in)
    return OrderDetailPublic.model_validate(order_detail)

@router.put("/{id}", response_model=OrderDetailPublic)
def update_order_detail(
    id: uuid.UUID, order_detail_in: OrderDetailUpdate, session: SessionDep
) -> Any:
    order_detail = crud_get_order_detail(session=session, id=id)
    if not order_detail:
        raise HTTPException(status_code=404, detail="OrderDetail not found")
    order_detail = crud_update_order_detail(
        session=session, 
        db_order_detail=order_detail, 
        order_detail_in=order_detail_in
    )
    return OrderDetailPublic.model_validate(order_detail)

@router.delete("/{id}")
def delete_order_detail(
    id: uuid.UUID, session: SessionDep
):
    order_detail = crud_get_order_detail(session=session, id=id)
    if not order_detail:
        raise HTTPException(status_code=404, detail="OrderDetail not found")
    crud_delete_order_detail(session=session, order_detail=order_detail)
    return {"message": "OrderDetail deleted successfully"}