# Asset Management System - API Documentation

**Version:** 2.0  
**Last Updated:** January 8, 2026  
**Base URL:** `/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Assets](#assets)
3. [Asset Types](#asset-types)
4. [Asset Statuses](#asset-statuses)
5. [Asset Attachments](#asset-attachments)
6. [Assignments](#assignments)
7. [Assignment Attachments](#assignment-attachments)
8. [Employees](#employees)
9. [Expenses](#expenses)
10. [Expense Types](#expense-types)
11. [Expense Attachments](#expense-attachments)
12. [Departments](#departments)
13. [Branches](#branches)
14. [Users](#users)
15. [Reports](#reports)
16. [Bulk Upload](#bulk-upload)
17. [System Configuration](#system-configuration)

---

## Authentication

### Register User
**Endpoint:** `POST /api/auth/register`  
**Authorization:** Required (Admin)  
**Description:** Register a new user in the system

**Request Body:**
```json
{
  "email": "user@jiranismart.com",
  "password": "securePassword123",
  "first_name": "Caleb",
  "last_name": "Kiprono",
  "role_id": 1
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@jiranismart.com",
    "first_name": "Caleb",
    "last_name": "Kiprono",
    "role_id": 1
  }
}
```

---

### Login
**Endpoint:** `POST /api/auth/login`  
**Authorization:** None  
**Description:** Authenticate user and receive access tokens

**Request Body:**
```json
{
  "email": "user@jiranismart.com",
  "password": "securePassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@jiranismart.com",
      "first_name": "Caleb",
      "last_name": "Kiprono",
      "role": "Admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "returnTo": "/assetsapp/dashboard"
  }
}
```

**Cookies Set:**
- `accessToken` - HTTP-only, 30 minutes expiry
- `refreshToken` - HTTP-only, 7 days expiry

---

### Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`  
**Authorization:** Refresh token in cookies  
**Description:** Refresh the access token using refresh token

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully"
}
```

---

### Logout
**Endpoint:** `POST /api/auth/logout`  
**Authorization:** Required  
**Description:** Logout user and clear authentication cookies

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

### Get All User Roles
**Endpoint:** `GET /api/auth/roles`  
**Authorization:** Required  
**Description:** Retrieve all available user roles

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": 1,
      "role_name": "Admin"
    },
    {
      "id": 2,
      "role_name": "Standard User"
    }
  ]
}
```

---

### Update User
**Endpoint:** `PUT /api/auth/update-user/:id`  
**Authorization:** Required  
**Description:** Update user information

**URL Parameters:**
- `id` - User ID

**Request Body:**
```json
{
  "email": "newemail@jiranismart.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role_id": 2
}
```

---

## Assets

### Get All Assets
**Endpoint:** `GET /api/assets/`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Retrieve all assets in the system

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assets retrieved successfully",
  "data": [
    {
      "id": 1,
      "asset_tag": "ASSET-001",
      "asset_name": "Dell Laptop",
      "asset_type_id": 1,
      "asset_type_name": "Computer Equipment",
      "purchase_date": "2025-01-01",
      "purchase_price": 1200.00,
      "current_value": 1000.00,
      "status_id": 1,
      "status_name": "Available",
      "branch_id": 1,
      "branch_name": "Head Office",
      "department_id": 1,
      "department_name": "IT"
    }
  ]
}
```

---

### Get Asset By ID
**Endpoint:** `GET /api/assets/:id`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Retrieve a specific asset by ID

**URL Parameters:**
- `id` - Asset ID

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Asset retrieved successfully",
  "data": {
    "id": 1,
    "asset_tag": "ASSET-001",
    "asset_name": "Dell Laptop",
    "description": "Dell Latitude 5420",
    "asset_type_id": 1,
    "purchase_date": "2025-01-01",
    "purchase_price": 1200.00,
    "current_value": 1000.00,
    "status_id": 1,
    "branch_id": 1,
    "department_id": 1,
    "serial_number": "SN12345678",
    "warranty_expiry_date": "2026-01-01"
  }
}
```

---

### Search Assets
**Endpoint:** `GET /api/assets/search`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Search assets with query parameters

**Query Parameters:**
- `asset_tag` - Asset tag (partial match)
- `asset_name` - Asset name (partial match)
- `status_id` - Status ID
- `asset_type_id` - Asset type ID
- `branch_id` - Branch ID
- `department_id` - Department ID

**Example:** `GET /api/assets/search?asset_name=laptop&status_id=1`

---

### Get Asset Statuses List
**Endpoint:** `GET /api/assets/statuses/list`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Get list of all asset statuses

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assets statuses retrieved successfully",
  "data": [
    {
      "id": 1,
      "status_name": "Available",
      "description": "Asset is available for assignment"
    },
    {
      "id": 2,
      "status_name": "In Use",
      "description": "Asset is currently assigned"
    }
  ]
}
```

---

### Create Asset
**Endpoint:** `POST /api/assets/`  
**Authorization:** Required (Admin)  
**Description:** Create a new asset

**Request Body:**
```json
{
  "asset_tag": "ASSET-002",
  "asset_name": "HP Laptop",
  "description": "HP EliteBook 840",
  "asset_type_id": 1,
  "purchase_date": "2025-01-05",
  "purchase_price": 1500.00,
  "current_value": 1500.00,
  "status_id": 1,
  "branch_id": 1,
  "department_id": 2,
  "serial_number": "HP98765432",
  "warranty_expiry_date": "2026-01-05"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Asset created successfully",
  "data": {
    "id": 2,
    "asset_tag": "ASSET-002",
    ...
  }
}
```

---

### Update Asset
**Endpoint:** `PUT /api/assets/:id`  
**Authorization:** Required (Admin)  
**Description:** Update an existing asset

**URL Parameters:**
- `id` - Asset ID

**Request Body:** Same as Create Asset

---

### Delete Asset
**Endpoint:** `DELETE /api/assets/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete an asset

**URL Parameters:**
- `id` - Asset ID

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Asset deleted successfully"
}
```

---

## Asset Types

### Create Asset Type
**Endpoint:** `POST /api/asset-types/create` or `POST /api/assets/asset-types/create`  
**Authorization:** Required (Admin)  
**Description:** Create a new asset type

**Request Body:**
```json
{
  "type_name": "Office Furniture",
  "description": "Desks, chairs, and cabinets"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Asset type created successfully",
  "data": {
    "id": 5,
    "type_name": "Office Furniture",
    "description": "Desks, chairs, and cabinets"
  }
}
```

---

### Get All Asset Types
**Endpoint:** `GET /api/asset-types` or `GET /api/assets/asset-types/all`  
**Authorization:** Required  
**Description:** Retrieve all asset types

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Asset types retrieved successfully",
  "data": [
    {
      "id": 1,
      "type_name": "Computer Equipment",
      "description": "Laptops, desktops, monitors"
    }
  ]
}
```

---

### Get Asset Type By ID
**Endpoint:** `GET /api/asset-types/:id`  
**Authorization:** Required  
**Description:** Retrieve a specific asset type

**URL Parameters:**
- `id` - Asset type ID

---

### Update Asset Type
**Endpoint:** `PUT /api/asset-types/:id`  
**Authorization:** Required (Admin)  
**Description:** Update an asset type

**URL Parameters:**
- `id` - Asset type ID

**Request Body:**
```json
{
  "type_name": "Updated Type Name",
  "description": "Updated description"
}
```

---

### Delete Asset Type
**Endpoint:** `DELETE /api/asset-types/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete an asset type

**URL Parameters:**
- `id` - Asset type ID

---

## Asset Statuses

### Create Asset Status
**Endpoint:** `POST /api/assets/asset-statuses/create`  
**Authorization:** Required (Admin, Super Admin)  
**Description:** Create a new asset status

**Request Body:**
```json
{
  "status_name": "Under Repair",
  "description": "Asset is being repaired"
}
```

---

### Get All Asset Statuses
**Endpoint:** `GET /api/assets/asset-statuses/all`  
**Authorization:** Required  
**Description:** Retrieve all asset statuses

---

### Get Asset Status By ID
**Endpoint:** `GET /api/assets/asset-statuses/:id`  
**Authorization:** Required  
**Description:** Retrieve a specific asset status

**URL Parameters:**
- `id` - Asset status ID

---

### Update Asset Status
**Endpoint:** `PUT /api/assets/asset-statuses/:id`  
**Authorization:** Required (Admin, Super Admin)  
**Description:** Update an asset status

**URL Parameters:**
- `id` - Asset status ID

---

### Delete Asset Status
**Endpoint:** `DELETE /api/assets/asset-statuses/:id`  
**Authorization:** Required (Admin, Super Admin)  
**Description:** Delete an asset status

**URL Parameters:**
- `id` - Asset status ID

---

## Asset Attachments

### Upload Asset Attachment
**Endpoint:** `POST /api/asset-attachments/:assetId/attachments`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Upload an attachment for an asset  
**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `assetId` - Asset ID

**Form Data:**
- `file` - File to upload (max 10MB)

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Attachment uploaded successfully",
  "data": {
    "id": 1,
    "asset_id": 1,
    "file_name": "invoice.pdf",
    "file_path": "/uploads/assets/invoice.pdf",
    "file_size": 102400,
    "uploaded_at": "2026-01-08T10:30:00Z"
  }
}
```

---

### Get Asset Attachments
**Endpoint:** `GET /api/asset-attachments/:assetId/attachments`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Get all attachments for an asset

**URL Parameters:**
- `assetId` - Asset ID

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Attachments retrieved successfully",
  "data": [
    {
      "id": 1,
      "asset_id": 1,
      "file_name": "invoice.pdf",
      "file_path": "/uploads/assets/invoice.pdf",
      "file_size": 102400,
      "uploaded_at": "2026-01-08T10:30:00Z"
    }
  ]
}
```

---

### Delete Asset Attachment
**Endpoint:** `DELETE /api/asset-attachments/attachments/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete an asset attachment

**URL Parameters:**
- `id` - Attachment ID

---

## Assignments

### Assign Asset
**Endpoint:** `POST /api/assignments/`  
**Authorization:** Required (Admin)  
**Description:** Assign an asset to an employee

**Request Body:**
```json
{
  "asset_id": 1,
  "employee_id": 5,
  "assigned_date": "2026-01-08",
  "notes": "Laptop for development work"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Asset assigned successfully",
  "data": {
    "id": 10,
    "asset_id": 1,
    "employee_id": 5,
    "assigned_date": "2026-01-08",
    "return_date": null,
    "notes": "Laptop for development work"
  }
}
```

---

### Get Assignment By ID
**Endpoint:** `GET /api/assignments/:id`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Retrieve assignment details

**URL Parameters:**
- `id` - Assignment ID

---

### Return Asset
**Endpoint:** `PUT /api/assignments/:id/return`  
**Authorization:** Required (Admin)  
**Description:** Mark an asset as returned

**URL Parameters:**
- `id` - Assignment ID

**Request Body:**
```json
{
  "return_date": "2026-01-08",
  "return_notes": "Asset returned in good condition"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Asset returned successfully",
  "data": {
    "id": 10,
    "asset_id": 1,
    "employee_id": 5,
    "assigned_date": "2026-01-01",
    "return_date": "2026-01-08",
    "return_notes": "Asset returned in good condition"
  }
}
```

---

### Get Asset Assignment History
**Endpoint:** `GET /api/assignments/asset/:assetId/history`  
**Authorization:** Required  
**Description:** Get assignment history for a specific asset

**URL Parameters:**
- `assetId` - Asset ID

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Asset history retrieved successfully",
  "data": [
    {
      "id": 10,
      "asset_id": 1,
      "asset_tag": "ASSET-001",
      "employee_id": 5,
      "employee_name": "Caleb Kiprono",
      "assigned_date": "2026-01-01",
      "return_date": "2026-01-08",
      "notes": "Laptop for development work"
    }
  ]
}
```

---

## Assignment Attachments

### Upload Assignment Attachment
**Endpoint:** `POST /api/assignment-attachments/:assignmentId/attachments`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Upload an attachment for an assignment  
**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `assignmentId` - Assignment ID

**Form Data:**
- `file` - File to upload (max 10MB)

---

### Get Assignment Attachments
**Endpoint:** `GET /api/assignment-attachments/:assignmentId/attachments`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Get all attachments for an assignment

**URL Parameters:**
- `assignmentId` - Assignment ID

---

### Delete Assignment Attachment
**Endpoint:** `DELETE /api/assignment-attachments/attachments/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete an assignment attachment

**URL Parameters:**
- `id` - Attachment ID

---

## Employees

### Get Employee By ID
**Endpoint:** `GET /api/employees/:id`  
**Authorization:** Required  
**Description:** Retrieve employee details

**URL Parameters:**
- `id` - Employee ID

---

### Get Employee Assets
**Endpoint:** `GET /api/employees/:employeeId/assets`  
**Authorization:** Required  
**Description:** Get all assets assigned to an employee

**URL Parameters:**
- `employeeId` - Employee ID

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employee assets retrieved successfully",
  "data": [
    {
      "asset_id": 1,
      "asset_tag": "ASSET-001",
      "asset_name": "Dell Laptop",
      "assigned_date": "2026-01-01",
      "assignment_id": 10
    }
  ]
}
```

---

## Expenses

### Get Expense By ID
**Endpoint:** `GET /api/expenses/:id`  
**Authorization:** Required  
**Description:** Retrieve expense details

**URL Parameters:**
- `id` - Expense ID

---

### Add Expense
**Endpoint:** `POST /api/expenses/`  
**Authorization:** Required (Admin)  
**Description:** Record a new expense

**Request Body:**
```json
{
  "asset_id": 1,
  "expense_type_id": 2,
  "expense_date": "2026-01-08",
  "amount": 250.00,
  "description": "Screen replacement",
  "vendor": "Tech Repairs Inc"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Expense added successfully",
  "data": {
    "id": 15,
    "asset_id": 1,
    "expense_type_id": 2,
    "expense_date": "2026-01-08",
    "amount": 250.00,
    "description": "Screen replacement",
    "vendor": "Tech Repairs Inc"
  }
}
```

---

## Expense Types

### Create Expense Type
**Endpoint:** `POST /api/expenses/expense-types/create`  
**Authorization:** Required (Admin)  
**Description:** Create a new expense type

**Request Body:**
```json
{
  "type_name": "Upgrade",
  "description": "Hardware or software upgrades"
}
```

---

### Get All Expense Types
**Endpoint:** `GET /api/expenses/expense-types/all`  
**Authorization:** Required  
**Description:** Retrieve all expense types

---

### Get Expense Type By ID
**Endpoint:** `GET /api/expenses/expense-types/:id`  
**Authorization:** Required  
**Description:** Retrieve a specific expense type

**URL Parameters:**
- `id` - Expense type ID

---

### Update Expense Type
**Endpoint:** `PUT /api/expenses/expense-types/:id`  
**Authorization:** Required (Admin)  
**Description:** Update an expense type

**URL Parameters:**
- `id` - Expense type ID

---

### Delete Expense Type
**Endpoint:** `DELETE /api/expenses/expense-types/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete an expense type

**URL Parameters:**
- `id` - Expense type ID

---

## Expense Attachments

### Upload Expense Attachment
**Endpoint:** `POST /api/expense-attachments/:expenseId/attachments`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Upload an attachment for an expense  
**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `expenseId` - Expense ID

**Form Data:**
- `file` - File to upload (max 10MB)

---

### Get Expense Attachments
**Endpoint:** `GET /api/expense-attachments/:expenseId/attachments`  
**Authorization:** Required (Admin, Standard User)  
**Description:** Get all attachments for an expense

**URL Parameters:**
- `expenseId` - Expense ID

---

### Delete Expense Attachment
**Endpoint:** `DELETE /api/expense-attachments/attachments/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete an expense attachment

**URL Parameters:**
- `id` - Attachment ID

---

## Departments

### Get All Departments
**Endpoint:** `GET /api/departments/`  
**Authorization:** None  
**Description:** Retrieve all departments

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "id": 1,
      "department_name": "IT",
      "description": "Information Technology"
    }
  ]
}
```

---

### Get Department By ID
**Endpoint:** `GET /api/departments/:id`  
**Authorization:** None  
**Description:** Retrieve a specific department

**URL Parameters:**
- `id` - Department ID

---

### Create Department
**Endpoint:** `POST /api/departments/`  
**Authorization:** Required (Admin)  
**Description:** Create a new department

**Request Body:**
```json
{
  "department_name": "Marketing",
  "description": "Marketing and Communications"
}
```

---

### Update Department
**Endpoint:** `PUT /api/departments/:id`  
**Authorization:** Required (Admin)  
**Description:** Update a department

**URL Parameters:**
- `id` - Department ID

---

### Delete Department
**Endpoint:** `DELETE /api/departments/:id`  
**Authorization:** Required (Admin)  
**Description:** Delete a department

**URL Parameters:**
- `id` - Department ID

---

## Branches

### Get All Branches
**Endpoint:** `GET /api/branches/`  
**Authorization:** None  
**Description:** Retrieve all branches

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Branches retrieved successfully",
  "data": [
    {
      "id": 1,
      "branch_name": "Head Office",
      "location": "New York",
      "address": "123 Main Street"
    }
  ]
}
```

---

### Get Branch By ID
**Endpoint:** `GET /api/branches/:id`  
**Authorization:** None  
**Description:** Retrieve a specific branch

**URL Parameters:**
- `id` - Branch ID

---

### Create Branch
**Endpoint:** `POST /api/branches/`  
**Authorization:** None  
**Description:** Create a new branch

**Request Body:**
```json
{
  "branch_name": "West Coast Office",
  "location": "San Francisco",
  "address": "456 Market Street"
}
```

---

### Update Branch
**Endpoint:** `PUT /api/branches/:id`  
**Authorization:** None  
**Description:** Update a branch

**URL Parameters:**
- `id` - Branch ID

---

### Delete Branch
**Endpoint:** `DELETE /api/branches/:id`  
**Authorization:** None  
**Description:** Delete a branch

**URL Parameters:**
- `id` - Branch ID

---

## Users

### Get User By ID
**Endpoint:** `GET /api/users/:id`  
**Authorization:** Required  
**Description:** Retrieve user details

**URL Parameters:**
- `id` - User ID

---

### Update User Profile
**Endpoint:** `PUT /api/users/profile`  
**Authorization:** Required  
**Description:** Update current user's profile

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@jiranismart.com"
}
```

---

### Change Password
**Endpoint:** `POST /api/users/change-password`  
**Authorization:** Required  
**Description:** Change current user's password

**Request Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newSecurePassword456",
  "confirm_password": "newSecurePassword456"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

---

### Reset Password
**Endpoint:** `POST /api/users/reset-password/:id`  
**Authorization:** Required  
**Description:** Reset a user's password (Admin function)

**URL Parameters:**
- `id` - User ID

**Request Body:**
```json
{
  "new_password": "tempPassword123"
}
```

---

### Toggle User Status
**Endpoint:** `POST /api/users/toggle-status/:id`  
**Authorization:** Required  
**Description:** Activate or deactivate a user account

**URL Parameters:**
- `id` - User ID

**Request Body:**
```json
{
  "is_active": false
}
```

---

## Reports

### Get Filtered Assets Report
**Endpoint:** `GET /api/reports/assets`  
**Authorization:** Required  
**Description:** Get filtered assets report with pagination

**Query Parameters:**
- `asset_tag` - Filter by asset tag
- `asset_name` - Filter by asset name
- `status_id` - Filter by status
- `asset_type_id` - Filter by asset type
- `branch_id` - Filter by branch
- `department_id` - Filter by department
- `limit` - Number of records per page (default: 20)
- `offset` - Starting record number (default: 0)

**Example:** `GET /api/reports/assets?status_id=1&limit=50&offset=0`

---

### Export Assets Report
**Endpoint:** `GET /api/reports/assets/export`  
**Authorization:** Required  
**Description:** Export assets report to Excel

**Query Parameters:** Same as Get Filtered Assets Report

**Response:** Excel file download

---

### Get Assets By Employee
**Endpoint:** `GET /api/reports/assets/employee/:employeeId`  
**Authorization:** Required  
**Description:** Get all assets assigned to a specific employee

**URL Parameters:**
- `employeeId` - Employee ID

---

### Get Assets By Branch
**Endpoint:** `GET /api/reports/assets/branch/:location`  
**Authorization:** Required  
**Description:** Get all assets at a specific branch

**URL Parameters:**
- `location` - Branch location or ID

---

### Get Expense Report Data
**Endpoint:** `GET /api/reports/expenses`  
**Authorization:** Required  
**Description:** Get filtered expenses report with pagination

**Query Parameters:**
- `asset_id` - Filter by asset
- `expense_type_id` - Filter by expense type
- `from_date` - Start date (YYYY-MM-DD)
- `to_date` - End date (YYYY-MM-DD)
- `min_amount` - Minimum amount
- `max_amount` - Maximum amount
- `limit` - Number of records per page (default: 20)
- `offset` - Starting record number (default: 0)

**Example:** `GET /api/reports/expenses?from_date=2025-01-01&to_date=2026-01-08&limit=50`

---

### Export Expenses Report
**Endpoint:** `GET /api/reports/expenses/export`  
**Authorization:** Required  
**Description:** Export expenses report to Excel

**Query Parameters:** Same as Get Expense Report Data

**Response:** Excel file download

---

### Get Expenses By Time Period
**Endpoint:** `GET /api/reports/expenses/time-period`  
**Authorization:** Required (Admin)  
**Description:** Get expenses within a specific time period

**Query Parameters:**
- `from_date` - Start date (YYYY-MM-DD)
- `to_date` - End date (YYYY-MM-DD)

---

### Get Assignment Report Data
**Endpoint:** `GET /api/reports/assignments`  
**Authorization:** Required  
**Description:** Get filtered assignments report with pagination

**Query Parameters:**
- `asset_tag` - Filter by asset tag
- `asset_id` - Filter by asset ID
- `employee_id` - Filter by employee ID
- `from_date` - Start date (YYYY-MM-DD)
- `to_date` - End date (YYYY-MM-DD)
- `is_returned` - Filter by return status (true/false)
- `limit` - Number of records per page (default: 20)
- `offset` - Starting record number (default: 0)

**Example:** `GET /api/reports/assignments?is_returned=false&limit=20&offset=0`

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignments retrieved successfully",
  "data": {
    "assignments": [
      {
        "assignment_id": 10,
        "asset_id": 1,
        "asset_tag": "ASSET-001",
        "asset_name": "Dell Laptop",
        "employee_id": 5,
        "employee_name": "Caleb Kiprono",
        "assigned_date": "2026-01-01",
        "return_date": null,
        "notes": "Laptop for development"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Export Assignment Report
**Endpoint:** `GET /api/reports/assignments/export`  
**Authorization:** Required  
**Description:** Export assignments report to Excel

**Query Parameters:** Same as Get Assignment Report Data

**Response:** Excel file download

---

### Get Action Log Report Data
**Endpoint:** `GET /api/reports/action-logs`  
**Authorization:** Required  
**Description:** Get filtered action logs report with pagination

**Query Parameters:**
- `action_type` - Filter by action type (e.g., "CREATE", "UPDATE", "DELETE")
- `user_id` - Filter by user who performed action
- `entity_type` - Filter by entity type (e.g., "Asset", "Assignment")
- `from_date` - Start date (YYYY-MM-DD)
- `to_date` - End date (YYYY-MM-DD)
- `limit` - Number of records per page (default: 20)
- `offset` - Starting record number (default: 0)

**Example:** `GET /api/reports/action-logs?action_type=CREATE&limit=50&offset=0`

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Action logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": 100,
        "action_type": "CREATE",
        "entity_type": "Asset",
        "entity_id": 1,
        "user_id": 5,
        "user_name": "Caleb Kiprono",
        "action_date": "2026-01-08T10:30:00Z",
        "description": "Created new asset ASSET-001"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Export Action Log Report
**Endpoint:** `GET /api/reports/action-logs/export`  
**Authorization:** Required  
**Description:** Export action logs report to Excel

**Query Parameters:** Same as Get Action Log Report Data

**Response:** Excel file download

---

## Bulk Upload

### Bulk Upload Assets
**Endpoint:** `POST /api/upload/assets`  
**Authorization:** Required (Admin)  
**Description:** Upload multiple assets via Excel file  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - Excel file (.xlsx) with asset data

**Excel File Format:**
Required columns:
- `asset_tag` - Unique asset identifier
- `asset_name` - Name of the asset
- `asset_type_id` - Asset type ID
- `purchase_date` - Date (YYYY-MM-DD)
- `purchase_price` - Decimal number
- `status_id` - Status ID
- `branch_id` - Branch ID
- `department_id` - Department ID

Optional columns:
- `description` - Asset description
- `serial_number` - Serial number
- `current_value` - Current value
- `warranty_expiry_date` - Date (YYYY-MM-DD)

**Success Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Assets uploaded successfully",
  "data": {
    "total": 50,
    "successful": 48,
    "failed": 2,
    "errors": [
      {
        "row": 5,
        "error": "Duplicate asset tag"
      },
      {
        "row": 12,
        "error": "Invalid asset type ID"
      }
    ]
  }
}
```

---

## System Configuration

### Get System Configuration
**Endpoint:** `GET /api/system-config/`  
**Authorization:** Required (Admin)  
**Description:** Retrieve system configuration settings

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Configuration retrieved successfully",
  "data": {
    "id": 1,
    "company_name": "JSL Systems",
    "company_email": "contact@jslsystems.com",
    "company_phone": "+1-555-0100",
    "company_address": "123 Business Ave",
    "logo_url": "/uploads/logos/company-logo.png",
    "currency": "USD",
    "date_format": "YYYY-MM-DD",
    "timezone": "America/New_York"
  }
}
```

---

### Get Public Configuration
**Endpoint:** `GET /api/system-config/public`  
**Authorization:** None  
**Description:** Retrieve public system configuration (for login page, etc.)

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Public configuration retrieved successfully",
  "data": {
    "company_name": "JSL Systems",
    "logo_url": "/uploads/logos/company-logo.png"
  }
}
```

---

### Update System Configuration
**Endpoint:** `PUT /api/system-config/`  
**Authorization:** Required (Admin)  
**Description:** Update system configuration settings

**Request Body:**
```json
{
  "company_name": "JSL Systems Inc.",
  "company_email": "info@jslsystems.com",
  "company_phone": "+1-555-0101",
  "company_address": "456 Corporate Drive",
  "currency": "USD",
  "date_format": "MM/DD/YYYY",
  "timezone": "America/Los_Angeles"
}
```

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Configuration updated successfully",
  "data": {
    "id": 1,
    "company_name": "JSL Systems Inc.",
    ...
  }
}
```

---

### Upload Company Logo
**Endpoint:** `POST /api/system-config/upload-logo`  
**Authorization:** Required (Admin)  
**Description:** Upload or update company logo  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `logo` - Image file (max 5MB, image formats only)

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logo uploaded successfully",
  "data": {
    "logo_url": "/uploads/logos/company-logo-1704715800000.png"
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request data",
  "error": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required",
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied",
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Asset with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## Authentication & Authorization

### Authentication Method
The API uses **JWT (JSON Web Tokens)** for authentication. Tokens are stored in HTTP-only cookies:

- **Access Token:** Valid for 30 minutes
- **Refresh Token:** Valid for 7 days

### Cookie Names
- `accessToken` - Used for API authentication
- `refreshToken` - Used for token refresh

### Authorization Roles
The system supports role-based access control:

1. **Admin** - Full system access
2. **Standard User** - Limited access to view and basic operations
3. **Super Admin** - System-level configuration access (specific endpoints)

### Making Authenticated Requests
Authentication is handled automatically via cookies. For external API clients:

1. Login via `/api/auth/login` to receive tokens
2. Tokens are automatically sent with subsequent requests via cookies
3. When access token expires, use `/api/auth/refresh-token` to get a new one
4. Logout via `/api/auth/logout` to clear tokens

---

## Data Formats

### Date Format
All dates should be in ISO 8601 format: `YYYY-MM-DD`

Example: `2026-01-08`

### DateTime Format
All timestamps are in ISO 8601 format with timezone: `YYYY-MM-DDTHH:mm:ssZ`

Example: `2026-01-08T10:30:00Z`

### Currency
All monetary values are decimal numbers with 2 decimal places.

Example: `1299.99`

---

## Pagination

Endpoints that support pagination use the following query parameters:

- `limit` - Number of records per page (default: 20, max: 100)
- `offset` - Starting record number (default: 0)

**Example:**
```
GET /api/reports/assets?limit=50&offset=100
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assets retrieved successfully",
  "data": {
    "items": [...],
    "total": 500,
    "limit": 50,
    "offset": 100,
    "hasMore": true
  }
}
```

---

## File Upload Limits

- **Asset Attachments:** 10MB max
- **Assignment Attachments:** 10MB max
- **Expense Attachments:** 10MB max
- **Company Logo:** 5MB max (images only)
- **Bulk Upload Excel:** Size depends on data volume

---

## Rate Limiting

Currently, there are no explicit rate limits implemented. However, it is recommended to:

- Avoid excessive concurrent requests
- Implement client-side throttling
- Use pagination for large datasets

---

## Changelog

### Version 2.0 (January 8, 2026)
- Complete API documentation update
- Added System Configuration endpoints
- Added Action Log reporting
- Enhanced filtering and pagination across all report endpoints
- Added attachment support for assets, assignments, and expenses
- Improved authentication with refresh token mechanism
- Added bulk upload functionality for assets

### Version 1.0 (September 20, 2025)
- Initial API release
- Basic CRUD operations for assets, assignments, and expenses
- User authentication and authorization
- Basic reporting functionality

---

## Support

For API support or questions, please contact:
- **Email:** fmbugua@jiranismart.com
- **Documentation:** This file
- **Base URL:** http://localhost:3000/api (development)

---

**Note:** This documentation is based on the current implementation as of January 8, 2026. Always refer to the latest version of this document for accurate API information.
