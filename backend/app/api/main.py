from fastapi import APIRouter

from app.api.router import (
    r_categories,
    r_products,
    r_variants,
    r_customers,
    r_stores,
    r_orders,
    r_order_details,
)


api_router = APIRouter()
api_router.include_router(r_categories.router)
api_router.include_router(r_products.router)
api_router.include_router(r_variants.router)
api_router.include_router(r_customers.router)
api_router.include_router(r_stores.router)
api_router.include_router(r_orders.router)
api_router.include_router(r_order_details.router)

# Nếu bạn có các router đặc biệt cho môi trường local, có thể include thêm tại đây
# if settings.ENVIRONMENT == "local":
#     api_router.include_router(private.router)
