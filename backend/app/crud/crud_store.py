import uuid
from typing import Any, List, Tuple

from sqlmodel import Session, select, func

from app.models import Store, StoreCreate, StoreUpdate

# Tạo mới cửa hàng
def create_store(*, session: Session, store_create: StoreCreate) -> Store:
    db_obj = Store.model_validate(store_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

# Cập nhật cửa hàng
def update_store(*, session: Session, db_store: Store, store_in: StoreUpdate) -> Any:
    store_data = store_in.model_dump(exclude_unset=True)
    db_store.sqlmodel_update(store_data)
    session.add(db_store)
    session.commit()
    session.refresh(db_store)
    return db_store

# Lấy store theo id
def get_store(*, session: Session, id: uuid.UUID) -> Store | None:
    """Lấy một store theo id"""
    return session.get(Store, id)

# Lấy danh sách store và tổng số, có phân trang
def get_stores(*, session: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Store], int]:
    """Lấy danh sách các stores với phân trang"""
    count_statement = select(func.count()).select_from(Store)
    count = session.exec(count_statement).one()
    statement = select(Store).offset(skip).limit(limit)
    stores = session.exec(statement).all()
    return stores, count

# Xóa store
def delete_store(*, session: Session, store: Store) -> None:
    """Xóa một store"""
    session.delete(store)
    session.commit()