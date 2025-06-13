import secrets
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    computed_field,
    Field,
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

# Hàm parse danh sách CORS origin, chấp nhận cả list hoặc chuỗi phân cách bằng dấu phẩy
def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)

class Settings(BaseSettings):    # Sử dụng file .env cho biến môi trường
    model_config = SettingsConfigDict(
        env_file="../../.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    API_V1_STR: str = "/api/v1"  # Tiền tố cho các route API
    SECRET_KEY: str = secrets.token_urlsafe(32)  # Khóa bí mật cho JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # Thời gian sống của access token (phút)
    FRONTEND_HOST: str = "http://localhost:5173"  # Địa chỉ frontend (nếu có)
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"  # Môi trường

    # CORS origins cho phép truy cập backend
    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    # Trả về danh sách các origin hợp lệ cho CORS
    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    PROJECT_NAME: str = "Demo Project"  # Tên dự án    # Cấu hình database PostgreSQL
    POSTGRES_SERVER: str = Field(default="localhost", alias="POSTGRES_DB_HOST")
    POSTGRES_PORT: int = Field(default=5432, alias="POSTGRES_DB_PORT")
    POSTGRES_USER: str = Field(default="postgres", alias="POSTGRES_DB_USER")
    POSTGRES_PASSWORD: str = Field(default="", alias="POSTGRES_DB_PASSWORD")
    POSTGRES_DB: str = Field(default="postgres", alias="POSTGRES_DB_NAME")

    # Sinh chuỗi kết nối SQLAlchemy
    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return MultiHostUrl.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

settings = Settings()  # Khởi tạo settings để import dùng mọi nơi