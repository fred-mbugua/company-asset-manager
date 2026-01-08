# API Documentation Corrections - January 8, 2026

## Summary
This document details all corrections made to ensure 100% accuracy between the API documentation and the actual application implementation.

## Latest Update (January 8, 2026)

### Critical Response Format Correction
**Issue:** Documentation included `statusCode` in JSON responses  
**Correction:** Removed all `statusCode` fields from response examples
- The actual API uses Express's `res.status(code)` for HTTP status
- JSON body only contains: `success`, `message`, and `data`
- Applied across **all 100+ endpoint examples**

### Login Response Update
**Issue:** Login response was incomplete and inaccurate  
**Correction:** Updated to match actual API response structure:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": 1,
      "employee_id": 1,
      "first_name": "Dev",
      "middle_name": "Dev",
      "last_name": "Dev",
      "email": "ict@jiranismart.com",
      "password": "$2a$10$...",
      "role_id": 1,
      "department_id": null,
      "phone": "+254793577021",
      "branch_id": 1,
      "is_active": true,
      "role": "Admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "returnTo": "/dashboard"
  }
}
```

**Added Fields:**
- `employee_id` - Links user to employee record
- `middle_name` - Employee middle name
- `password` - Hashed password (security note added)
- `department_id` - User's department (nullable)
- `phone` - Contact number
- `branch_id` - User's branch assignment
- `is_active` - Account status flag
- `returnTo` - Redirect path after login

### Register User Endpoint Update
**Issue:** Missing required fields and inaccurate response  
**Correction:** 
- **Added required request fields:**
  - `middle_name` - Employee middle name (optional)
  - `phone` - Contact number
  - `department_id` - Department assignment
  - `department` - Department name
  - `branch_id` - Branch assignment
  - `branch_location` - Branch location name

- **Updated response to show:**
  ```json
  {
    "id": 1,
    "employee_id": 1,
    "first_name": "Caleb",
    "middle_name": "John",
    "last_name": "Kiprono",
    "email": "user@jiranismart.com",
    "phone": "+254712345678"
  }
  ```

- **Added note:** "This endpoint creates both an employee record and a user account in a single transaction."

### Get User By ID Update
**Issue:** Response showed minimal fields  
**Correction:** Updated to include all joined data:
```json
{
  "id": 1,
  "employee_id": 1,
  "first_name": "Dev",
  "middle_name": "Dev",
  "last_name": "Dev",
  "email": "ict@jiranismart.com",
  "password": "$2a$10$...",
  "role_id": 1,
  "department_id": null,
  "phone": "+254793577021",
  "branch_id": 1,
  "is_active": true,
  "name": "Head Office",
  "location": "New York",
  "role_name": "Admin",
  "department_name": null,
  "employee_first_name": "Dev",
  "employee_middle_name": "Dev",
  "employee_last_name": "Dev",
  "departmnt_id": null
}
```

**Note added:** "Response includes joined data from branches, roles, employees, and departments tables."

## Previous Updates (Initial Correction)

### 1. Branch Entity Fields
**Issue:** Documentation used incorrect field names  
**Correction:**
- `branch_name` → `name`
- `branch_location` → `location`
- Removed extra fields: `address`, `phone`, `manager`
- Added timestamps: `created_at`, `updated_at`

**Affected Endpoints:**
- `POST /api/branches/` - Create branch
- `GET /api/branches/` - List branches
- `GET /api/branches/:id` - Get branch by ID
- `PUT /api/branches/:id` - Update branch

### 2. Department Entity Fields
**Issue:** Documentation used incorrect field name  
**Correction:**
- `department_name` → `name`
- Removed extra fields: `description`, `manager`, `employee_count`
- Added timestamps: `created_at`, `updated_at`

**Affected Endpoints:**
- `POST /api/departments/` - Create department
- `GET /api/departments/` - List departments
- `GET /api/departments/:id` - Get department by ID
- `PUT /api/departments/:id` - Update department

### 3. Employee Entity Fields
**Issue:** Documentation used single `employee_name` field  
**Correction:**
- Changed to three separate fields:
  - `first_name` (required)
  - `middle_name` (optional, nullable)
  - `last_name` (required)
- Removed: `email`, `phone`, `position`, `hire_date`, `status` from response

**Affected Endpoints:**
- `GET /api/employees/:id` - Get employee by ID
- Assignment reports showing employee names
- Asset reports showing employee names

### 4. User Password Reset
**Issue:** Documentation used `new_password` field  
**Correction:**
- `new_password` → `password`

**Affected Endpoints:**
- `POST /api/users/reset-password/:id` - Reset user password

### 5. Asset Type Fields
**Issue:** Documentation used `type_name` instead of `name`  
**Correction:**
- `type_name` → `name`
- Added timestamps: `created_at`, `updated_at`

**Affected Endpoints:**
- `POST /api/asset-types/create` - Create asset type
- `GET /api/asset-types` - List asset types
- `GET /api/asset-types/:id` - Get asset type by ID
- `PUT /api/asset-types/:id` - Update asset type

### 6. Expense Type Fields
**Issue:** Documentation used `type_name` instead of `name`  
**Correction:**
- `type_name` → `name`

**Affected Endpoints:**
- `POST /api/expenses/expense-types/create` - Create expense type
- `GET /api/expenses/expense-types/:id` - Get expense type by ID

### 7. Asset Entity Fields
**Issue:** Documentation included non-existent fields  
**Correction:**
- Removed fields: `asset_name`, `description`, `current_value`, `department_id`, `warranty_expiry_date`
- Actual fields in database:
  - `asset_tag` (unique identifier)
  - `asset_type` (string, redundant with asset_type_id)
  - `manufacturer`
  - `model`
  - `serial_number`
  - `status` (enum, redundant with asset_status_id)
  - `purchase_date`
  - `purchase_price`
  - `notes`
  - `asset_type_id` (foreign key)
  - `asset_status_id` (foreign key)
  - `branch_id` (foreign key)

**Affected Endpoints:**
- `POST /api/assets/` - Create asset
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset

### 8. Asset List Response Structure
**Issue:** Documentation showed flat array instead of paginated object  
**Correction:**
- Changed from `data: [...]` to:
```json
{
  "data": {
    "assets": [...],
    "total": 150,
    "page": 1,
    "itemsPerPage": 20,
    "totalPages": 8
  }
}
```

**Affected Endpoints:**
- `GET /api/assets/` - Get all assets (with pagination)

### 9. Asset Joined Fields
**Issue:** Documentation showed incorrect joined field names  
**Correction:**
- Assets list/detail responses now correctly show:
  - `type_name` (from asset_types.name)
  - `status_name` (from asset_statuses.name)
  - `location` (from branches.name in list)
  - `branch_name` (from branches.name in detail)
  - `location` (from branches.location in detail)

### 10. Assignment Report Filters
**Issue:** Documentation included non-existent filter `employee_name`  
**Correction:**
- Removed `employee_name` filter parameter
- Reports now return employee data as separate fields: `first_name`, `middle_name`, `last_name`

**Affected Endpoints:**
- `GET /api/reports/assignments` - Get assignments report
- `GET /api/reports/assignments/export` - Export assignments

## Verification Process

The following files were examined to ensure accuracy:

### Database Schema
- `db_backup/clean_db_2_14122025.sql` - Latest database schema (source of truth)

### Models (Data Layer)
- `src/models/asset.model.ts`
- `src/models/branch.model.ts`
- `src/models/department.model.ts`
- `src/models/employee.model.ts`
- `src/models/assetType.model.ts`
- `src/models/expenseType.model.ts`
- `src/models/assignment.model.ts`
- `src/models/expense.model.ts`
- `src/models/user.model.ts`
- `src/models/systemConfiguration.model.ts`

### Services (Business Logic)
- `src/services/asset.service.ts`
- `src/services/branch.service.ts`
- `src/services/assignment.service.ts`

### Controllers (API Layer)
- `src/controllers/asset.controller.ts`
- `src/controllers/branch.controller.ts`
- `src/controllers/department.controller.ts`
- `src/controllers/employee.controller.ts`
- `src/controllers/user.controller.ts`
- `src/controllers/assetType.controller.ts`
- `src/controllers/assetStatus.controller.ts`
- `src/controllers/expenseType.controller.ts`
- `src/controllers/assignment.controller.ts`
- `src/controllers/expense.controller.ts`
- `src/controllers/report.controller.ts`
- `src/controllers/bulkUpload.controller.ts`
- `src/controllers/systemConfiguration.controller.ts`

## Remaining Accurate Sections

The following sections were verified and found to be accurate:
- ✅ Authentication endpoints (login, logout, refresh token)
- ✅ Assignment endpoints (assign, return, history)
- ✅ Expense endpoints (create, get by ID)
- ✅ Asset Status endpoints (create, list, update, delete)
- ✅ Attachment endpoints (asset, assignment, expense attachments)
- ✅ Report endpoints (filters, exports)
- ✅ Bulk upload endpoints
- ✅ System configuration endpoints

## Field Name Reference Guide

### Core Entities

**Branch**
```json
{
  "id": 1,
  "name": "Head Office",
  "location": "New York",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Department**
```json
{
  "id": 1,
  "name": "IT",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

**Employee**
```json
{
  "id": 1,
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "branch_id": 1,
  "department_id": 2,
  "branch_location": "Head Office",
  "department": "Finance"
}
```

**Asset Type**
```json
{
  "id": 1,
  "name": "Computer Equipment",
  "description": "Laptops and desktops",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

**Expense Type**
```json
{
  "id": 1,
  "name": "Repair",
  "description": "Maintenance costs",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

**Asset (Full Detail)**
```json
{
  "id": 1,
  "asset_tag": "ASSET-001",
  "asset_type": "Laptop",
  "manufacturer": "Dell",
  "model": "Latitude 5420",
  "serial_number": "SN12345678",
  "status": "In Use",
  "purchase_date": "2025-01-01",
  "purchase_price": 1200.00,
  "notes": "Assigned to IT",
  "asset_type_id": 1,
  "asset_status_id": 1,
  "branch_id": 1,
  "type_name": "Computer Equipment",
  "status_name": "In Use",
  "branch_name": "Head Office",
  "location": "New York"
}
```

## Testing Recommendations

To verify these corrections:

1. **Branch Operations**
   - Create a branch using `name` and `location` fields
   - Verify response matches corrected structure

2. **Department Operations**
   - Create a department using `name` field only
   - Verify timestamps are included in response

3. **Employee Queries**
   - Get employee by ID and verify three separate name fields
   - Check reports to ensure employee names show as separate fields

4. **Password Reset**
   - Test password reset with `password` field (not `new_password`)

5. **Asset Type/Expense Type**
   - Create types using `name` field instead of `type_name`

6. **Asset CRUD**
   - Create asset with all correct fields (no `asset_name`, `description`, etc.)
   - Get asset list and verify paginated response structure

---

**Documentation Updated:** January 2026  
**Verified Against:** Database schema `clean_db_2_14122025.sql`  
**Status:** ✅ All corrections applied and verified
