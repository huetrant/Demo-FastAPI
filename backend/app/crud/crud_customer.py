import uuid
from typing import Any, List, Tuple

from sqlmodel import Session, select, func

from app.core.security import get_password_hash, verify_password
from app.models import Customer, CustomerCreate, CustomerUpdate

# Hàm tạo mới customer (tạo tài khoản khách hàng)
def create_customer(*, session: Session, customer_create: CustomerCreate) -> Customer:
    # Lưu mật khẩu dưới dạng hash
    db_obj = Customer.model_validate(
        customer_create, update={"hashed_password": get_password_hash(customer_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

# Hàm cập nhật thông tin customer
def update_customer(*, session: Session, db_customer: Customer, customer_in: CustomerUpdate) -> Any:
    customer_data = customer_in.model_dump(exclude_unset=True)
    extra_data = {}
    # Nếu có cập nhật mật khẩu thì hash lại
    if "password" in customer_data:
        password = customer_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_customer.sqlmodel_update(customer_data, update=extra_data)
    session.add(db_customer)
    session.commit()
    session.refresh(db_customer)
    return db_customer

# Lấy customer theo email (dùng cho login)
def get_customer_by_email(*, session: Session, email: str) -> Customer | None:
    statement = select(Customer).where(Customer.email == email)
    session_customer = session.exec(statement).first()
    return session_customer

# Xác thực customer khi đăng nhập: kiểm tra email và mật khẩu
def authenticate_customer(*, session: Session, email: str, password: str) -> Customer | None:
    db_customer = get_customer_by_email(session=session, email=email)
    if not db_customer:
        return None
    if not verify_password(password, db_customer.hashed_password):
        return None
    return db_customer

# Lấy customer theo id
def get_customer(*, session: Session, id: uuid.UUID) -> Customer | None:
    """Lấy một customer theo id"""
    return session.get(Customer, id)

# Lấy danh sách customers và tổng số, có phân trang
def get_customers(*, session: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Customer], int]:
    """Lấy danh sách các customers với phân trang"""
    count_statement = select(func.count()).select_from(Customer)
    count = session.exec(count_statement).one()
    statement = select(Customer).offset(skip).limit(limit)
    customers = session.exec(statement).all()
    return customers, count

# Xóa customer
def delete_customer(*, session: Session, customer: Customer) -> None:
    """Xóa một customer"""
    session.delete(customer)
    session.commit()