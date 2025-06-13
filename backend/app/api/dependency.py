from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.core.database import engine
from app.models import TokenPayload
from app.models import Customer  # Sử dụng model Customer

# OAuth2 scheme để lấy token từ request
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

# Dependency để lấy session database
def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]

# Lấy current customer từ JWT token
def get_current_customer(session: SessionDep, token: TokenDep) -> Customer:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    customer = session.get(Customer, token_data.sub)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Nếu có trường is_active, kiểm tra trạng thái tài khoản (tùy model thực tế)
    if hasattr(customer, "is_active") and not customer.is_active:
        raise HTTPException(status_code=400, detail="Inactive customer")
    return customer

CurrentCustomer = Annotated[Customer, Depends(get_current_customer)]