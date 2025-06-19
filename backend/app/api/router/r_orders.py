import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    Order,
    OrderCreate,
    OrderUpdate,
    OrderPublic,
    OrdersPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_order import (
    create_order as crud_create_order,
    update_order as crud_update_order,
    get_order as crud_get_order,
    get_orders as crud_get_orders,
    delete_order as crud_delete_order,
)

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=OrdersPublic)
def read_orders(
    session: SessionDep, page: int = 1, pageSize: int = 10
) -> Any:
    skip = (page - 1) * pageSize
    orders, count = crud_get_orders(session=session, skip=skip, limit=pageSize)
    data = [OrderPublic.model_validate(order) for order in orders]
    return OrdersPublic(data=data, count=count, page=page, pageSize=pageSize, totalPages= -(-count // pageSize))

@router.get("/{id}", response_model=OrderPublic)
def read_order(
    id: uuid.UUID, session: SessionDep
) -> Any:
    order = crud_get_order(session=session, id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderPublic.model_validate(order)

@router.post("/", response_model=OrderPublic)
def create_order(
    order_in: OrderCreate, session: SessionDep
) -> Any:
    order = crud_create_order(session=session, order_create=order_in)
    return OrderPublic.model_validate(order)

@router.put("/{id}", response_model=OrderPublic)
def update_order(
    id: uuid.UUID, order_in: OrderUpdate, session: SessionDep
) -> Any:
    order = crud_get_order(session=session, id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order = crud_update_order(session=session, db_order=order, order_in=order_in)
    return OrderPublic.model_validate(order)

@router.delete("/{id}")
def delete_order(
    id: uuid.UUID, session: SessionDep
):
    order = crud_get_order(session=session, id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    crud_delete_order(session=session, order=order)
    return {"message": "Order deleted successfully"}