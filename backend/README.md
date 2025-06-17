# Backend

## Overview
This backend is built with FastAPI, a modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints. It provides a modular API structure with routers for categories, products, variants, customers, stores, orders, and order details. The backend uses SQLModel and SQLAlchemy for database modeling and interactions.

## Tech Stack
- Python 3.7+
- FastAPI
- SQLModel
- SQLAlchemy
- Uvicorn (ASGI server)

## Folder Structure
- `app/api/router/`: Contains API route modules for different resources.
- `app/models.py`: Defines the data models using SQLModel.
- `app/core/`: Core configurations and utilities.
- `app/crud/`: CRUD operations for different models.
- `app/api/main.py`: Main API router that includes all sub-routers.

## Installation and Running
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```

## API Overview
The backend exposes RESTful endpoints for managing categories, products, variants, customers, stores, orders, and order details. Each resource has its own router module.

---

# Backend (Tiếng Việt)

## Tổng quan
Backend này được xây dựng bằng FastAPI, một framework web hiện đại, nhanh (hiệu suất cao) để xây dựng API với Python 3.7+ dựa trên các kiểu dữ liệu chuẩn của Python. Nó cung cấp cấu trúc API mô-đun với các router cho categories, products, variants, customers, stores, orders và order details. Backend sử dụng SQLModel và SQLAlchemy để mô hình hóa và tương tác với cơ sở dữ liệu.

## Công nghệ sử dụng
- Python 3.7+
- FastAPI
- SQLModel
- SQLAlchemy
- Uvicorn (ASGI server)

## Cấu trúc thư mục
- `app/api/router/`: Chứa các module route API cho các tài nguyên khác nhau.
- `app/models.py`: Định nghĩa các mô hình dữ liệu sử dụng SQLModel.
- `app/core/`: Cấu hình và tiện ích cốt lõi.
- `app/crud/`: Các thao tác CRUD cho các mô hình khác nhau.
- `app/api/main.py`: Router API chính bao gồm tất cả các sub-router.

## Cài đặt và chạy
1. Tạo và kích hoạt môi trường ảo:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Trên Windows dùng `venv\Scripts\activate`
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   pip install -r requirements.txt
   ```
3. Chạy server backend:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```

## Tổng quan API
Backend cung cấp các endpoint RESTful để quản lý categories, products, variants, customers, stores, orders và order details. Mỗi tài nguyên có một module router riêng.
