import uuid
from typing import Any, List, Tuple

from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload

from app.models import OrderDetail, OrderDetailCreate, OrderDetailUpdate

# Tạo mới chi tiết đơn hàng
def create_order_detail(*, session: Session, order_detail_create: OrderDetailCreate) -> OrderDetail:
    db_obj = OrderDetail.model_validate(order_detail_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

# Cập nhật chi tiết đơn hàng
def update_order_detail(*, session: Session, db_order_detail: OrderDetail, order_detail_in: OrderDetailUpdate) -> Any:
    order_detail_data = order_detail_in.model_dump(exclude_unset=True)
    db_order_detail.sqlmodel_update(order_detail_data)
    session.add(db_order_detail)
    session.commit()
    session.refresh(db_order_detail)
    return db_order_detail

# Lấy chi tiết đơn hàng theo id, eagerly load variant
def get_order_detail(*, session: Session, id: uuid.UUID) -> OrderDetail | None:
    statement = select(OrderDetail).options(selectinload(OrderDetail.variant)).where(OrderDetail.id == id)
    result = session.exec(statement)
    return result.one_or_none()

# Lấy danh sách chi tiết đơn hàng và tổng số, có phân trang, eagerly load variant
def get_order_details(*, session: Session, skip: int = 0, limit: int = 100, order_id: uuid.UUID = None) -> Tuple[List[OrderDetail], int]:
    if order_id:
        count_statement = select(func.count()).select_from(OrderDetail).where(OrderDetail.order_id == order_id)
        count = session.exec(count_statement).one()
        statement = select(OrderDetail).where(OrderDetail.order_id == order_id).options(selectinload(OrderDetail.variant)).offset(skip).limit(limit)
    else:
        count_statement = select(func.count()).select_from(OrderDetail)
        count = session.exec(count_statement).one()
        statement = select(OrderDetail).options(selectinload(OrderDetail.variant)).offset(skip).limit(limit)

    order_details = session.exec(statement).all()
    return order_details, count

# Xóa chi tiết đơn hàng
def delete_order_detail(*, session: Session, order_detail: OrderDetail) -> None:
    session.delete(order_detail)
    session.commit()
