# Asset Management System

A comprehensive web-based application for managing organizational assets throughout their lifecycle, built with Node.js, TypeScript, Express.js, and PostgreSQL.

**Version:** 2.1  
**Last Updated:** January 18, 2026

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [API Quick Reference](#api-quick-reference)

---

## Overview

The Asset Management System helps organizations track, manage, and maintain their assets efficiently. It provides functionality for asset registration, employee assignments, expense tracking, repair request workflows, and comprehensive reporting.

### User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access including configuration and user management | All features |
| **Standard User** | Access to daily operations and personal records | Limited features |

---

## Features

- **Asset Management**: Register, track, and manage organizational assets with custom types and statuses
- **Assignment Tracking**: Assign assets to employees and maintain complete assignment history
- **Expense Management**: Record and track asset-related expenses (purchases, repairs, logistics)
- **Repair Request Workflow**: Multi-stage approval workflow for repair requests with configurable stages
- **Reporting**: Generate comprehensive reports on assets, assignments, expenses, and action logs
- **User Management**: Role-based access control with Admin and Standard User roles
- **Bulk Operations**: Import assets and users in bulk via Excel files
- **File Attachments**: Upload and manage documents/files for assets, assignments, expenses, and repair requests
- **System Configuration**: Customizable company branding, email settings, and security policies
- **Audit Trail**: Complete action logging for compliance and tracking

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend Runtime | Node.js |
| Language | TypeScript |
| Web Framework | Express.js |
| Database | PostgreSQL |
| Template Engine | EJS (Embedded JavaScript) |
| Authentication | JWT (JSON Web Tokens) |
| File Storage | Local Server / Firebase (configurable) |
| Process Manager | PM2 |

---

## Prerequisites

Before installation, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (v14.x or higher)
- **Git**

---

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd asset-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a PostgreSQL database
   - Run the initial database script:
     ```bash
     psql -U your_username -d your_database -f db_queries/initial\ db.sql
     ```
   - Run migration scripts as needed from `db_queries/` folder

4. **Configure environment variables**
   - Copy `.env.example` to `.env` (if available) or create a `.env` file
   - Update the configuration values (see [Configuration](#configuration))

---

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_manager
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_email_password
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Using PM2 (Recommended for Production)

```bash
pm2 start ecosystem.config.js
```

The application will be available at `http://localhost:3000` (or your configured port).

---

## Project Structure

```
asset-manager/
├── src/                          # Source code directory
│   ├── app.ts                    # Express application setup
│   ├── server.ts                 # Server entry point
│   ├── config/                   # Configuration files
│   ├── controllers/              # Request handlers
│   ├── middlewares/              # Express middlewares
│   ├── models/                   # Database models
│   ├── routes/                   # Route definitions
│   ├── services/                 # Business logic
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── views/                    # EJS templates
├── uploads/                      # File upload storage
├── db_queries/                   # Database migration scripts
├── db_backup/                    # Database backup files
├── logs/                         # Application logs
├── package.json
├── tsconfig.json
└── ecosystem.config.js           # PM2 configuration
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete API reference with all endpoints, request/response formats |
| [USER_MANUAL.md](USER_MANUAL.md) | End-user guide for using the web interface |
| [DOCUMENTATION_CHANGES.md](DOCUMENTATION_CHANGES.md) | Changelog for documentation updates |

---

## API Quick Reference

Base URL: `/api`

### Response Format

All API responses follow a standard JSON format:

```json
// Success
{"success": true, "message": "...", "data": {...}}

// Error
{"success": false, "message": "..."}
```

### Core Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Authentication | `/api/auth/*` | Login, logout, register, token refresh |
| Assets | `/api/assets/*` | Asset CRUD operations |
| Asset Types | `/api/asset-types/*` | Asset type management |
| Assignments | `/api/assignments/*` | Asset assignment operations |
| Expenses | `/api/expenses/*` | Expense tracking |
| Repair Requests | `/api/repair-requests/*` | Repair workflow management |
| Reports | `/api/reports/*` | Report generation and export |
| Users | `/api/users/*` | User management |
| Departments | `/api/departments/*` | Department management |
| Branches | `/api/branches/*` | Branch/location management |
| System Config | `/api/system-config/*` | System configuration |
| Bulk Import | `/api/bulk-user-import/*` | Bulk user import |

For detailed API documentation including request/response examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

---

## License

Proprietary - freestylecodetechnologies systems

---

## Support

For technical support or questions, contact Fred.