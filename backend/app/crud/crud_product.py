import uuid
from typing import Any, List, Tuple, Optional

from sqlmodel import Session, select, func, or_, and_

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

# Tìm kiếm sản phẩm theo tên và mô tả
def search_products(
    *, 
    session: Session, 
    query: str, 
    skip: int = 0, 
    limit: int = 100,
    category_id: Optional[uuid.UUID] = None
) -> Tuple[List[Product], int]:
    """
    Tìm kiếm sản phẩm theo tên và mô tả
    """
    # Tạo điều kiện tìm kiếm
    search_conditions = [
        Product.name.ilike(f"%{query}%"),
        Product.descriptions.ilike(f"%{query}%")
    ]
    
    # Kết hợp các điều kiện tìm kiếm
    where_clause = or_(*search_conditions)
    
    # Thêm điều kiện lọc theo category nếu có
    if category_id:
        where_clause = and_(where_clause, Product.categories_id == category_id)
    
    # Đếm tổng số kết quả
    count_statement = select(func.count()).select_from(Product).where(where_clause)
    count = session.exec(count_statement).one()
    
    # Lấy danh sách sản phẩm
    statement = select(Product).where(where_clause).offset(skip).limit(limit)
    products = session.exec(statement).all()
    
    return products, count