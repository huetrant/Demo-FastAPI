import uuid
from typing import Any, List, Tuple

from sqlmodel import Session, select, func

from app.models import Product, ProductCreate, ProductUpdate

# Tạo mới sản phẩm
def create_product(*, session: Session, product_create: ProductCreate) -> Product:
    db_obj = Product.model_validate(product_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

# Cập nhật sản phẩm
def update_product(*, session: Session, db_product: Product, product_in: ProductUpdate) -> Any:
    product_data = product_in.model_dump(exclude_unset=True)
    db_product.sqlmodel_update(product_data)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

# Lấy sản phẩm theo id
def get_product(*, session: Session, id: uuid.UUID) -> Product | None:
    return session.get(Product, id)

# Lấy danh sách sản phẩm và tổng số, có phân trang
def get_products(*, session: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Product], int]:
    count_statement = select(func.count()).select_from(Product)
    count = session.exec(count_statement).one()
    statement = select(Product).offset(skip).limit(limit)
    products = session.exec(statement).all()
    return products, count

# Xóa sản phẩm
def delete_product(*, session: Session, product: Product) -> None:
    session.delete(product)
    session.commit()