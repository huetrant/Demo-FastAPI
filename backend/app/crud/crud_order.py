import uuid
from typing import Any, List, Tuple

from sqlmodel import Session, select, func

from app.models import Order, OrderCreate, OrderUpdate

# Tạo mới đơn hàng
def create_order(*, session: Session, order_create: OrderCreate) -> Order:
    db_obj = Order.model_validate(order_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

# Cập nhật đơn hàng
def update_order(*, session: Session, db_order: Order, order_in: OrderUpdate) -> Any:
    order_data = order_in.model_dump(exclude_unset=True)
    db_order.sqlmodel_update(order_data)
    session.add(db_order)
    session.commit()
    session.refresh(db_order)
    return db_order

# Lấy đơn hàng theo id
def get_order(*, session: Session, id: uuid.UUID) -> Order | None:
    return session.get(Order, id)

# Lấy danh sách đơn hàng và tổng số, có phân trang
def get_orders(*, session: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Order], int]:
    count_statement = select(func.count()).select_from(Order)
    count = session.exec(count_statement).one()
    statement = select(Order).offset(skip).limit(limit)
    orders = session.exec(statement).all()
    return orders, count

# Xóa đơn hàng
def delete_order(*, session: Session, order: Order) -> None:
    session.delete(order)
    session.commit()