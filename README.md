# Project Overview

This project is a full-stack application consisting of a backend API built with FastAPI and a frontend web application built with React.

- The **backend** provides RESTful API endpoints for managing categories, products, variants, customers, stores, orders, and order details. It uses FastAPI, SQLModel, and SQLAlchemy for database interactions.
- The **frontend** is a React application using Redux for state management and React Router for client-side routing. It is built with TypeScript and Vite.

## Setup and Running

### Backend
1. Create and activate a virtual environment in the root folder:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
2. Install FastAPI and Uvicorn in the virtual environment:
   ```bash
   pip install fastapi uvicorn
   ```
3. The backend dependencies are managed in `backend/pyproject.toml`.
4. Run the backend server:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at the URL shown in the terminal (usually http://localhost:3000).

---

# Tổng quan dự án

Dự án này là một ứng dụng full-stack bao gồm backend API xây dựng bằng FastAPI và ứng dụng web frontend xây dựng bằng React.

- **Backend** cung cấp các endpoint RESTful để quản lý categories, products, variants, customers, stores, orders và order details. Sử dụng FastAPI, SQLModel và SQLAlchemy để tương tác với cơ sở dữ liệu.
- **Frontend** là ứng dụng React sử dụng Redux để quản lý trạng thái và React Router để điều hướng phía client. Được xây dựng bằng TypeScript và Vite.

## Cài đặt và chạy

### Backend
1. Tạo và kích hoạt môi trường ảo ở thư mục gốc:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Trên Windows dùng `venv\Scripts\activate`
   ```
2. Cài đặt FastAPI và Uvicorn trong môi trường ảo:
   ```bash
   pip install fastapi uvicorn
   ```
3. Các thư viện backend được quản lý trong file `backend/pyproject.toml`.
4. Chạy server backend:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```

### Frontend
1. Vào thư mục `frontend`.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy server phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại URL hiển thị trong terminal (thường là http://localhost:3000).
