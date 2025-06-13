from typing import Generator
from sqlmodel import create_engine, Session

from app.core.config import settings

# Khởi tạo SQLAlchemy engine từ chuỗi kết nối trong settings
engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    echo=True,  # Set to False in production
    pool_pre_ping=True,
)

# Dependency để inject database session
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()
