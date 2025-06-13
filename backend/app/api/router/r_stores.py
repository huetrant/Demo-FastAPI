import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, func

from app.models import (
    Store,
    StoreCreate,
    StoreUpdate,
    StorePublic,
    StoresPublic,
)
from app.api.dependency import SessionDep
from app.crud.crud_store import (
    create_store as crud_create_store,
    update_store as crud_update_store,
    get_store as crud_get_store,
    get_stores as crud_get_stores,
    delete_store as crud_delete_store,
)

router = APIRouter(prefix="/stores", tags=["stores"])

@router.get("/", response_model=StoresPublic)
def read_stores(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    stores, count = crud_get_stores(session=session, skip=skip, limit=limit)
    data = [StorePublic.model_validate(store) for store in stores]
    return StoresPublic(data=data, count=count)

@router.get("/{id}", response_model=StorePublic)
def read_store(
    id: uuid.UUID, session: SessionDep
) -> Any:
    store = crud_get_store(session=session, id=id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return StorePublic.model_validate(store)

@router.post("/", response_model=StorePublic)
def create_store(
    store_in: StoreCreate, session: SessionDep
) -> Any:
    store = crud_create_store(session=session, store_create=store_in)
    return StorePublic.model_validate(store)

@router.put("/{id}", response_model=StorePublic)
def update_store(
    id: uuid.UUID, store_in: StoreUpdate, session: SessionDep
) -> Any:
    store = crud_get_store(session=session, id=id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    store = crud_update_store(
        session=session,
        db_store=store,
        store_in=store_in
    )
    return StorePublic.model_validate(store)

@router.delete("/{id}")
def delete_store(
    id: uuid.UUID, session: SessionDep
):
    store = crud_get_store(session=session, id=id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    crud_delete_store(session=session, store=store)
    return {"message": "Store deleted successfully"}