# Project Overview

This project is a full-stack web application consisting of a backend API built with FastAPI and a frontend web application built with React and TypeScript.

## Features

- **Backend**: Provides RESTful API endpoints to manage categories, products, variants, customers, stores, orders, and order details. Built with FastAPI, SQLModel, and SQLAlchemy for efficient database interactions.
- **Frontend**: A modern React application using Redux Toolkit for state management and React Router for client-side routing. Built with TypeScript and Vite for fast development and build.

## Prerequisites

- Python 3.7 or higher
- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)
- Git (optional, for version control)

## Backend Setup and Running

1. **Create and activate a Python virtual environment** in the root folder (or backend folder):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
2. **Install backend dependencies**:
   The backend dependencies are managed in `backend/pyproject.toml` using Poetry. If you don't have Poetry installed, install it first:
   ```bash
   pip install poetry
   ```
   Then install the dependencies:
   ```bash
   poetry install
   ```
3. **Run the backend server**:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```
   The server will start on `http://127.0.0.1:8000` by default.

## Frontend Setup and Running

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install frontend dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Open your browser** and go to the URL shown in the terminal (usually `http://localhost:3000`).

## Project Structure Overview

```
/
├── backend/           # Backend FastAPI application
│   ├── app/           # Application source code
│   ├── pyproject.toml # Backend dependencies and configuration
│   └── README.md      # Backend specific documentation
├── frontend/          # Frontend React application
│   ├── src/           # Source code for React app
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies and scripts
│   └── README.md      # Frontend specific documentation
└── README.md          # This file
```

## Additional Information

- The backend API supports CRUD operations for various resources such as categories, products, variants, customers, stores, orders, and order details.
- The frontend consumes the backend API and provides a user-friendly interface for managing these resources.
- Both backend and frontend are actively developed and maintained.

---

# Tổng quan dự án

Dự án này là một ứng dụng web full-stack bao gồm backend API xây dựng bằng FastAPI và ứng dụng web frontend xây dựng bằng React và TypeScript.

## Tính năng

- **Backend**: Cung cấp các endpoint RESTful để quản lý categories, products, variants, customers, stores, orders và order details. Được xây dựng bằng FastAPI, SQLModel và SQLAlchemy để tương tác hiệu quả với cơ sở dữ liệu.
- **Frontend**: Ứng dụng React hiện đại sử dụng Redux Toolkit để quản lý trạng thái và React Router để điều hướng phía client. Được xây dựng bằng TypeScript và Vite để phát triển và build nhanh.

## Yêu cầu trước khi cài đặt

- Python 3.7 trở lên
- Node.js (phiên bản 14 trở lên được khuyến nghị)
- npm (đi kèm với Node.js)
- Git (tuỳ chọn, để quản lý phiên bản)

## Cài đặt và chạy Backend

1. **Tạo và kích hoạt môi trường ảo Python** trong thư mục gốc (hoặc thư mục backend):
   ```bash
   python -m venv venv
   # Trên Windows
   venv\Scripts\activate
   # Trên macOS/Linux
   source venv/bin/activate
   ```
2. **Cài đặt các thư viện phụ thuộc cho backend**:
   Các thư viện backend được quản lý trong file `backend/pyproject.toml` sử dụng Poetry. Nếu chưa cài Poetry, cài đặt trước:
   ```bash
   pip install poetry
   ```
   Sau đó cài đặt các thư viện:
   ```bash
   poetry install
   ```
3. **Chạy server backend**:
   ```bash
   uvicorn backend.app.api.main:api_router --reload
   ```
   Server sẽ chạy tại `http://127.0.0.1:8000` theo mặc định.

## Cài đặt và chạy Frontend

1. **Đi vào thư mục frontend**:
   ```bash
   cd frontend
   ```
2. **Cài đặt các thư viện phụ thuộc cho frontend**:
   ```bash
   npm install
   ```
3. **Chạy server phát triển**:
   ```bash
   npm run dev
   ```
4. **Mở trình duyệt** và truy cập URL hiển thị trong terminal (thường là `http://localhost:3000`).

## Cấu trúc dự án tổng quan

```
/
├── backend/           # Ứng dụng FastAPI phía backend
│   ├── app/           # Mã nguồn ứng dụng
│   ├── pyproject.toml # Cấu hình và thư viện backend
│   └── README.md      # Tài liệu riêng cho backend
├── frontend/          # Ứng dụng React phía frontend
│   ├── src/           # Mã nguồn ứng dụng React
│   ├── public/        # Tài nguyên tĩnh
│   ├── package.json   # Cấu hình và thư viện frontend
│   └── README.md      # Tài liệu riêng cho frontend
└── README.md          # File này
```

## Thông tin thêm

- Backend API hỗ trợ các thao tác CRUD cho nhiều tài nguyên như categories, products, variants, customers, stores, orders và order details.
- Frontend sử dụng API backend và cung cấp giao diện thân thiện để quản lý các tài nguyên này.
- Cả backend và frontend đều được phát triển và duy trì liên tục.
