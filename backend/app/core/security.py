# File: backend/app/core/security.py
# Các hàm bảo mật: mã hóa mật khẩu, xác thực JWT
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from .config import settings

# Khởi tạo context mã hóa mật khẩu (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Thuật toán mã hóa JWT
ALGORITHM = "HS256"

# Hàm tạo access token JWT cho user/customer
def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Hàm kiểm tra mật khẩu sau khi mã hóa (dùng khi đăng nhập)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Hàm mã hóa mật khẩu khi lưu vào database
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)