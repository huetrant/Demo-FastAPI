import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    Product,
    ProductCreate,
    ProductUpdate,
    ProductPublic,
    ProductsPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_product import (
    create_product as crud_create_product,
    update_product as crud_update_product,
    get_product as crud_get_product,
    get_products as crud_get_products,
    delete_product as crud_delete_product,
)

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=ProductsPublic)
def read_products(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    products, count = crud_get_products(session=session, skip=skip, limit=limit)
    data = [ProductPublic.model_validate(prod) for prod in products]
    return ProductsPublic(data=data, count=count)

@router.get("/{id}", response_model=ProductPublic)
def read_product(
    id: uuid.UUID, session: SessionDep
) -> Any:
    product = crud_get_product(session=session, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductPublic.model_validate(product)

@router.post("/", response_model=ProductPublic)
def create_product(
    product_in: ProductCreate, session: SessionDep
) -> Any:
    product = crud_create_product(session=session, product_create=product_in)
    return ProductPublic.model_validate(product)

@router.put("/{id}", response_model=ProductPublic)
def update_product(
    id: uuid.UUID, product_in: ProductUpdate, session: SessionDep
) -> Any:
    product = crud_get_product(session=session, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product = crud_update_product(session=session, db_product=product, product_in=product_in)
    return ProductPublic.model_validate(product)

@router.delete("/{id}")
def delete_product(
    id: uuid.UUID, session: SessionDep
):
    product = crud_get_product(session=session, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    crud_delete_product(session=session, product=product)
    return {"message": "Product deleted successfully"}