import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    Customer,
    CustomerCreate,
    CustomerUpdate,
    CustomerPublic,
    CustomersPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_customer import (
    create_customer as crud_create_customer,
    update_customer as crud_update_customer,
    get_customer as crud_get_customer,
    get_customers as crud_get_customers,
    delete_customer as crud_delete_customer,
)

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=CustomersPublic)
def read_customers(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    customers, count = crud_get_customers(session=session, skip=skip, limit=limit)
    data = [CustomerPublic.model_validate(cus) for cus in customers]
    return CustomersPublic(data=data, count=count)

@router.get("/{id}", response_model=CustomerPublic)
def read_customer(
    id: uuid.UUID, session: SessionDep
) -> Any:
    customer = crud_get_customer(session=session, id=id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerPublic.model_validate(customer)

@router.post("/", response_model=CustomerPublic)
def create_customer(
    customer_in: CustomerCreate, session: SessionDep
) -> Any:
    customer = crud_create_customer(session=session, customer_create=customer_in)
    return CustomerPublic.model_validate(customer)

@router.put("/{id}", response_model=CustomerPublic)
def update_customer(
    id: uuid.UUID, customer_in: CustomerUpdate, session: SessionDep
) -> Any:
    customer = crud_get_customer(session=session, id=id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer = crud_update_customer(session=session, db_customer=customer, customer_in=customer_in)
    return CustomerPublic.model_validate(customer)

@router.delete("/{id}")
def delete_customer(
    id: uuid.UUID, session: SessionDep
):
    customer = crud_get_customer(session=session, id=id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    crud_delete_customer(session=session, customer=customer)
    return {"message": "Customer deleted successfully"}