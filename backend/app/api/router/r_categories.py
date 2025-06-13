import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    Category,
    CategoryCreate,
    CategoryUpdate,
    CategoryPublic,
    CategoriesPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_categories import (
    create_category as crud_create_category,
    update_category as crud_update_category,
    get_category as crud_get_category,
    get_categories as crud_get_categories,
    delete_category as crud_delete_category,
)

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=CategoriesPublic)
def read_categories(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    categories, count = crud_get_categories(session=session, skip=skip, limit=limit)
    data = [CategoryPublic.model_validate(cat) for cat in categories]
    return CategoriesPublic(data=data, count=count)

@router.get("/{id}", response_model=CategoryPublic)
def read_category(
    id: uuid.UUID, session: SessionDep
) -> Any:
    category = crud_get_category(session=session, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryPublic.model_validate(category)

@router.post("/", response_model=CategoryPublic)
def create_category(
    category_in: CategoryCreate, session: SessionDep
) -> Any:
    category = crud_create_category(session=session, category_create=category_in)
    return CategoryPublic.model_validate(category)

@router.put("/{id}", response_model=CategoryPublic)
def update_category(
    id: uuid.UUID, category_in: CategoryUpdate, session: SessionDep
) -> Any:
    category = crud_get_category(session=session, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category = crud_update_category(session=session, db_category=category, category_in=category_in)
    return CategoryPublic.model_validate(category)

@router.delete("/{id}")
def delete_category(
    id: uuid.UUID, session: SessionDep
):
    category = crud_get_category(session=session, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    crud_delete_category(session=session, category=category)
    return {"message": "Category deleted successfully"}