# Frontend

## Overview
This frontend application is built with React and TypeScript. It uses Redux Toolkit for state management and React Router for client-side routing. The project is scaffolded with Vite, a fast build tool for modern web projects.

## Features
- Responsive and user-friendly UI.
- State management with Redux Toolkit.
- Client-side routing with React Router.
- Fast development and build with Vite.
- Modular and reusable components.

## Tech Stack
- React
- TypeScript
- Redux Toolkit
- React Router
- Vite
- npm (package manager)

## Folder Structure
```
frontend/
├── public/                 # Static assets and main HTML file
├── src/
│   ├── components/         # Reusable UI components such as Navbar, common UI elements
│   │                         # - Navbar.tsx: Navigation bar component
│   │                         # - common/ConfirmDialog.tsx: Confirmation dialog component
│   │                         # - common/DataTable.tsx: Data table component for displaying tabular data
│   │                         # - common/ErrorAlert.tsx: Error alert component
│   │                         # - common/LoadingSpinner.tsx: Loading spinner component
│   ├── pages/              # Page components representing routes
│   │                         # - Dashboard.tsx: Main dashboard page
│   │                         # - Categories.tsx, Customers.tsx, Orders.tsx, Products.tsx, Stores.tsx: Resource management pages
│   │                         # - OrderDetail.tsx, ProductDetail.tsx: Detail pages for orders and products
│   ├── store/              # Redux store setup and slices for managing application state
│   │                         # - store configuration and slice files for different resources
│   ├── interfaces/         # TypeScript interfaces and types defining data structures
│   ├── utils/              # Utility functions and helpers
│   │                         # - API clients, formatters (colorFormatters.tsx, format.ts), validation utilities
│   ├── hooks/              # Custom React hooks for API calls and state management
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json            # Frontend dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```
└── vite.config.ts          # Vite configuration

## Prerequisites
- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)

## Installation and Running

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Open your browser** and go to the URL shown in the terminal (usually `http://localhost:3000`).

## Building for Production

To build the frontend for production, run:
```bash
npm run build
```
The build output will be in the `dist` folder.


---

# Frontend (Tiếng Việt)

## Tổng quan
Ứng dụng frontend này được xây dựng bằng React và TypeScript. Nó sử dụng Redux Toolkit để quản lý trạng thái và React Router để điều hướng phía client. Dự án được tạo bằng Vite, một công cụ build nhanh cho các dự án web hiện đại.

## Tính năng
- Giao diện người dùng thân thiện và đáp ứng.
- Quản lý trạng thái với Redux Toolkit.
- Điều hướng phía client với React Router.
- Phát triển và build nhanh với Vite.
- Các component mô-đun và tái sử dụng được.

## Công nghệ sử dụng
- React
- TypeScript
- Redux Toolkit
- React Router
- Vite
- npm (trình quản lý gói)

## Cấu trúc thư mục
```
frontend/
├── public/                 # Tài nguyên tĩnh và file HTML chính
├── src/
│   ├── components/         # Các component UI tái sử dụng như Navbar, các component UI chung
│   │                         # - Navbar.tsx: Component thanh điều hướng
│   │                         # - common/ConfirmDialog.tsx: Component hộp thoại xác nhận
│   │                         # - common/DataTable.tsx: Component bảng dữ liệu
│   │                         # - common/ErrorAlert.tsx: Component cảnh báo lỗi
│   │                         # - common/LoadingSpinner.tsx: Component hiển thị trạng thái tải
│   ├── pages/              # Các component trang đại diện cho các route
│   │                         # - Dashboard.tsx: Trang tổng quan chính
│   │                         # - Categories.tsx, Customers.tsx, Orders.tsx, Products.tsx, Stores.tsx: Các trang quản lý tài nguyên
│   │                         # - OrderDetail.tsx, ProductDetail.tsx: Trang chi tiết đơn hàng và sản phẩm
│   ├── store/              # Cấu hình Redux store và các slices để quản lý trạng thái ứng dụng
│   │                         # - Các file cấu hình store và slices cho các tài nguyên khác nhau
│   ├── interfaces/         # Các interface và kiểu dữ liệu TypeScript định nghĩa cấu trúc dữ liệu
│   ├── utils/              # Các hàm tiện ích và helper
│   │                         # - Các client API, các hàm định dạng (colorFormatters.tsx, format.ts), và các tiện ích xác thực
│   ├── hooks/              # Các hook React tùy chỉnh cho các cuộc gọi API và quản lý trạng thái
│   ├── App.tsx             # Component app chính
│   ├── main.tsx            # Điểm vào ứng dụng
│   └── index.css           # Các style toàn cục
├── package.json            # Cấu hình và thư viện frontend
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite
```
└── vite.config.ts          # Cấu hình Vite

## Yêu cầu trước khi cài đặt
- Node.js (phiên bản 14 trở lên được khuyến nghị)
- npm (đi kèm với Node.js)

## Cài đặt và chạy

1. **Đi vào thư mục frontend**:
   ```bash
   cd frontend
   ```
2. **Cài đặt các thư viện phụ thuộc**:
   ```bash
   npm install
   ```
3. **Chạy server phát triển**:
   ```bash
   npm run dev
   ```
4. **Mở trình duyệt** và truy cập URL hiển thị trong terminal (thường là `http://localhost:3000`).

## Build cho môi trường production

Để build frontend cho môi trường production, chạy:
```bash
npm run build
```
Kết quả build sẽ nằm trong thư mục `dist`.
