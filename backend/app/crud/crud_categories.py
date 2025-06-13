import uuid
from typing import Any, List, Tuple

from sqlmodel import Session, select, func

from app.models import Category, CategoryCreate, CategoryUpdate

# Hàm tạo mới category (danh mục sản phẩm)
def create_category(*, session: Session, category_create: CategoryCreate) -> Category:
    db_obj = Category.model_validate(category_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

# Hàm cập nhật category
def update_category(*, session: Session, db_category: Category, category_in: CategoryUpdate) -> Any:
    category_data = category_in.model_dump(exclude_unset=True)
    db_category.sqlmodel_update(category_data)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

# Lấy category theo id
def get_category(*, session: Session, id: uuid.UUID) -> Category | None:
    return session.get(Category, id)

# Lấy danh sách category và tổng số, có phân trang (skip/limit)
def get_categories(*, session: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Category], int]:
    count_statement = select(func.count()).select_from(Category)
    count = session.exec(count_statement).one()
    statement = select(Category).offset(skip).limit(limit)
    categories = session.exec(statement).all()
    return categories, count

# Xóa category
def delete_category(*, session: Session, category: Category) -> None:
    session.delete(category)
    session.commit()