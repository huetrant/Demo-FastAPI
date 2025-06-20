# Backend

## Overview
This backend application is built with FastAPI, a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. It provides a modular API structure with routers for categories, products, variants, customers, stores, orders, and order details. The backend uses SQLModel and SQLAlchemy for database modeling and interactions.

## Features
- RESTful API endpoints for managing categories, products, variants, customers, stores, orders, and order details.
- Modular router structure for clean and maintainable code.
- Database interactions using SQLModel and SQLAlchemy.
- Asynchronous support for high performance.
- Easy to extend and maintain.

## Tech Stack
- Python 3.7+
- FastAPI
- SQLModel
- SQLAlchemy
- Uvicorn (ASGI server)
- Poetry (dependency management)

## Folder Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── router/          # API route modules for different resources, e.g., categories, customers, orders, products, stores, variants
│   │   │   ├── r_categories.py       # Routes for category-related API endpoints
│   │   │   ├── r_customers.py        # Routes for customer-related API endpoints
│   │   │   ├── r_order_details.py    # Routes for order detail-related API endpoints
│   │   │   ├── r_orders.py            # Routes for order-related API endpoints
│   │   │   ├── r_products.py          # Routes for product-related API endpoints
│   │   │   ├── r_stores.py            # Routes for store-related API endpoints
│   │   │   ├── r_variants.py          # Routes for variant-related API endpoints
│   │   │   └── __init__.py            # Router package initializer
│   │   ├── main.py                    # Main API router including all sub-routers, entry point for API routing
│   │   └── dependency.py              # Dependency injection modules for managing API dependencies
│   ├── core/                        # Core configurations and utilities
│   │   ├── config.py                # Application configuration settings
│   │   ├── database.py              # Database connection and session management
│   │   └── security.py              # Security utilities such as authentication and authorization
│   ├── crud/                        # CRUD operations for different models
│   │   ├── crud_categories.py       # CRUD operations for categories
│   │   ├── crud_customer.py         # CRUD operations for customers
│   │   ├── crud_order.py            # CRUD operations for orders
│   │   ├── crud_order_detail.py     # CRUD operations for order details
│   │   ├── crud_product.py          # CRUD operations for products
│   │   ├── crud_store.py            # CRUD operations for stores
│   │   └── crud_variant.py          # CRUD operations for variants
│   ├── models.py                    # Data models using SQLModel, defines database schema
│   └── __init__.py                  # Package initializer
├── pyproject.toml                   # Backend dependencies and configuration managed by Poetry
└── README.md                       # Backend documentation
```
## Folder Structure

## Prerequisites
- Python 3.7 or higher
- Poetry (for dependency management)

## Installation and Running

1. **Create and activate a Python virtual environment** in the root folder (or backend folder):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
2. **Install Poetry** (if not installed):
   ```bash
   pip install poetry
   ```
3. **Install backend dependencies** using Poetry:
   ```bash
   poetry install
   ```
4. **Run the backend server**:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```
   The server will start on `http://127.0.0.1:8000` by default.

## API Overview
The backend exposes RESTful endpoints for managing the following resources:
- Categories
- Products
- Variants
- Customers
- Stores
- Orders
- Order Details

Each resource has its own router module under `app/api/router/`.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
Specify your project license here.

---

# Backend (Tiếng Việt)

## Tổng quan
Ứng dụng backend này được xây dựng bằng FastAPI, một framework web hiện đại, nhanh (hiệu suất cao) để xây dựng API với Python 3.7+ dựa trên các kiểu dữ liệu chuẩn của Python. Nó cung cấp cấu trúc API mô-đun với các router cho categories, products, variants, customers, stores, orders và order details. Backend sử dụng SQLModel và SQLAlchemy để mô hình hóa và tương tác với cơ sở dữ liệu.

## Tính năng
- Các endpoint RESTful để quản lý categories, products, variants, customers, stores, orders và order details.
- Cấu trúc router mô-đun giúp code sạch và dễ bảo trì.
- Tương tác cơ sở dữ liệu sử dụng SQLModel và SQLAlchemy.
- Hỗ trợ bất đồng bộ để hiệu suất cao.
- Dễ dàng mở rộng và bảo trì.

## Công nghệ sử dụng
- Python 3.7+
- FastAPI
- SQLModel
- SQLAlchemy
- Uvicorn (ASGI server)
- Poetry (quản lý thư viện)

## Cấu trúc thư mục
```
backend/
├── app/
│   ├── api/
│   │   ├── router/          # Các module route API cho các tài nguyên khác nhau, ví dụ: categories, customers, orders, products, stores, variants
│   │   │   ├── r_categories.py       # Các route cho endpoint API liên quan đến categories
│   │   │   ├── r_customers.py        # Các route cho endpoint API liên quan đến customers
│   │   │   ├── r_order_details.py    # Các route cho endpoint API liên quan đến order details
│   │   │   ├── r_orders.py            # Các route cho endpoint API liên quan đến orders
│   │   │   ├── r_products.py          # Các route cho endpoint API liên quan đến products
│   │   │   ├── r_stores.py            # Các route cho endpoint API liên quan đến stores
│   │   │   ├── r_variants.py          # Các route cho endpoint API liên quan đến variants
│   │   │   └── __init__.py            # Khởi tạo package router
│   │   ├── main.py                    # Router API chính bao gồm tất cả các sub-router, điểm vào routing API
│   │   └── dependency.py              # Các module dependency injection để quản lý các phụ thuộc API
│   ├── core/                        # Cấu hình và tiện ích cốt lõi
│   │   ├── config.py                # Cấu hình ứng dụng
│   │   ├── database.py              # Quản lý kết nối và phiên làm việc với cơ sở dữ liệu
│   │   └── security.py              # Các tiện ích bảo mật như xác thực và phân quyền
│   ├── crud/                        # Các thao tác CRUD cho các mô hình
│   │   ├── crud_categories.py       # CRUD cho categories
│   │   ├── crud_customer.py         # CRUD cho customers
│   │   ├── crud_order.py            # CRUD cho orders
│   │   ├── crud_order_detail.py     # CRUD cho order details
│   │   ├── crud_product.py          # CRUD cho products
│   │   ├── crud_store.py            # CRUD cho stores
│   │   └── crud_variant.py          # CRUD cho variants
│   ├── models.py                    # Các mô hình dữ liệu sử dụng SQLModel, định nghĩa schema cơ sở dữ liệu
│   └── __init__.py                  # Khởi tạo package
├── pyproject.toml                   # Cấu hình và thư viện backend quản lý bởi Poetry
└── README.md                       # Tài liệu backend
```
## Cấu trúc thư mục

## Yêu cầu trước khi cài đặt
- Python 3.7 trở lên
- Poetry (quản lý thư viện)

## Cài đặt và chạy

1. **Tạo và kích hoạt môi trường ảo Python** trong thư mục gốc (hoặc thư mục backend):
   ```bash
   python -m venv venv
   # Trên Windows
   venv\Scripts\activate
   # Trên macOS/Linux
   source venv/bin/activate
   ```
2. **Cài đặt Poetry** (nếu chưa cài):
   ```bash
   pip install poetry
   ```
3. **Cài đặt các thư viện backend** sử dụng Poetry:
   ```bash
   poetry install
   ```
4. **Chạy server backend**:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```
   Server sẽ chạy tại `http://127.0.0.1:8000` theo mặc định.

## Tổng quan API
Backend cung cấp các endpoint RESTful để quản lý các tài nguyên sau:
- Categories
- Products
- Variants
- Customers
- Stores
- Orders
- Order Details

Mỗi tài nguyên có một module router riêng trong `app/api/router/`.

## Đóng góp
Chào đón các đóng góp! Vui lòng fork repository và tạo pull request với các thay đổi của bạn.

## Giấy phép
Vui lòng chỉ định giấy phép dự án của bạn tại đây.
## Folder Structure
