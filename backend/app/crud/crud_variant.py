import uuid
from typing import Any, List, Tuple, Optional

from sqlmodel import Session, select, func, or_, and_, text

from app.models import Variant, VariantCreate, VariantUpdate

def get_variants(*, session: Session, skip: int = 0, limit: int | None = 100, product_id: uuid.UUID = None) -> Tuple[List[Variant], int]:
    """Lấy danh sách các variants với phân trang"""
    if product_id:
        count_statement = select(func.count()).select_from(Variant).where(Variant.product_id == product_id)
        count = session.exec(count_statement).one()
        statement = select(Variant).where(Variant.product_id == product_id).offset(skip)
        if limit is not None:
            statement = statement.limit(limit)
    else:
        count_statement = select(func.count()).select_from(Variant)
        count = session.exec(count_statement).one()
        statement = select(Variant).offset(skip)
        if limit is not None:
            statement = statement.limit(limit)

    variants = session.exec(statement).all()
    return variants, count

def get_variant(*, session: Session, id: uuid.UUID) -> Variant:
    """Lấy một variant theo id"""
    return session.get(Variant, id)

def create_variant(*, session: Session, variant_create: VariantCreate) -> Variant:
    """Tạo mới một variant"""
    db_obj = Variant.model_validate(variant_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def update_variant(*, session: Session, db_variant: Variant, variant_in: VariantUpdate) -> Variant:
    """Cập nhật thông tin một variant"""
    update_data = variant_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_variant, field, value)
    session.add(db_variant)
    session.commit()
    session.refresh(db_variant)
    return db_variant

def delete_variant(*, session: Session, variant: Variant) -> None:
    """Xóa một variant"""
    session.delete(variant)
    session.commit()

# Lấy variant theo id
def get_variant_by_id(*, session: Session, id: uuid.UUID) -> Variant | None:
    return session.get(Variant, id)

# Lấy danh sách variant, có phân trang
def get_list_variants(*, session: Session, skip: int = 0, limit: int = 100) -> list[Variant]:
    statement = select(Variant).offset(skip).limit(limit)
    return session.exec(statement).all()

# Tìm kiếm variants
def search_variants(
    *, 
    session: Session, 
    query: str, 
    skip: int = 0, 
    limit: int = 100,
    product_id: Optional[uuid.UUID] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
) -> Tuple[List[Variant], int]:
    """
    Tìm kiếm variant theo beverage_option và các tiêu chí khác
    """
    search_conditions = []
    
    # Tìm kiếm theo beverage_option
    if query:
        search_conditions.append(Variant.beverage_option.ilike(f"%{query}%"))
    
    # Lọc theo product_id
    if product_id:
        search_conditions.append(Variant.product_id == product_id)
    
    # Lọc theo khoảng giá
    if min_price is not None:
        search_conditions.append(Variant.price >= min_price)
    if max_price is not None:
        search_conditions.append(Variant.price <= max_price)
    
    # Kết hợp điều kiện
    where_clause = and_(*search_conditions) if search_conditions else text("1=1")
    
    # Đếm tổng số kết quả
    count_statement = select(func.count()).select_from(Variant).where(where_clause)
    count = session.exec(count_statement).one()
    
    # Lấy danh sách variants
    statement = select(Variant).where(where_clause).offset(skip).limit(limit)
    variants = session.exec(statement).all()
    
    return variants, count