# Asset Management System
# User Manual

**Version:** 2.2  
**Document Date:** January 24, 2026  
**Prepared by:** JSL-ICT

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Dashboard](#3-dashboard)
4. [Asset Management](#4-asset-management)
5. [Assignment Management](#5-assignment-management)
6. [Expense Management](#6-expense-management)
7. [Repair Requests](#7-repair-requests)
8. [Reports](#8-reports)
9. [Administration](#9-administration)
10. [Permissions Management](#10-permissions-management)
11. [Branch Hierarchy](#11-branch-hierarchy)
12. [System Configuration](#12-system-configuration)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Introduction

### 1.1 Purpose

The Asset Management System is a comprehensive web-based application designed to help organizations track, manage, and maintain their assets throughout their lifecycle. This manual provides step-by-step instructions for all users to effectively utilize the system's features.

### 1.2 System Overview

The system provides the following core functionalities:

- **Asset Management**: Register, track, and manage organizational assets
- **Assignment Tracking**: Assign assets to employees and maintain assignment history
- **Expense Management**: Record and track asset-related expenses
- **Repair Requests**: Submit and manage repair requests with workflow approval
- **Reporting**: Generate comprehensive reports on assets, expenses, and activities
- **User Management**: Role-based access control for secure system usage
- **Permissions Management**: Granular permission control for each role and module
- **Branch Hierarchy**: Organizational branch structure with hierarchical data access

### 1.3 User Roles

The system supports flexible user roles with customizable permissions:

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access including configuration and user management | All features |
| **Standard User** | Access to daily operations based on assigned permissions | Permission-based |
| **Custom Roles** | Configurable roles with specific permissions per module | Customizable |

### 1.4 Permission Types

Each module can have the following permission types:

| Permission | Description |
|------------|-------------|
| **Read** | View records and data |
| **Create** | Add new records |
| **Update** | Modify existing records |
| **Delete** | Remove records |
| **Branch Level Access** | Restrict data access to user's branch only |
| **Company Level Access** | Restrict data access to user's company |

---

## 2. Getting Started

### 2.1 Accessing the System

1. Open your web browser (Chrome, Firefox, Edge, or Safari recommended)
2. Navigate to your organization's Asset Management System URL
3. The login page will be displayed

### 2.2 Logging In

1. On the login page, enter your registered **Email Address**
2. Enter your **Password**
3. Click the **Login** button
4. Upon successful authentication, you will be redirected to the Dashboard

> **Note:** If you forget your password, contact your system administrator to reset it.

### 2.3 Logging Out

1. Click on your **profile name** in the top navigation bar
2. Select **Logout** from the dropdown menu
3. You will be redirected to the login page

### 2.4 Navigation Overview

The system interface consists of:

- **Top Navigation Bar**: Displays the application name, your profile, and logout option
- **Sidebar Menu**: Main navigation menu for accessing different modules
- **Content Area**: The main working area where pages are displayed

#### Sidebar Menu Structure:

| Menu Item | Sub-menu | Description |
|-----------|----------|-------------|
| Dashboard | - | System overview and statistics |
| Assets | Create, View | Asset management functions |
| Assignments | View, Assign | Asset assignment functions |
| Expenses | Create | Expense recording functions |
| Repair Requests | All Requests, New Request, Workflow Config* | Repair management |
| Reports | Assets, Expenses, Assignments, Repair Summary, Action Logs* | Report generation |
| Administration* | Users, Roles, Permissions, Branches, Branch Hierarchy, Departments, etc. | System administration |
| Settings* | System Configuration | System settings |

*Admin only (or based on role permissions)

### 2.5 Access Denied (403)

If you try to access a feature you don't have permission for, you will see an "Access Denied" page. This means:
- Your role doesn't have the required permission for this module
- Contact your administrator to request access if needed

---

## 3. Dashboard

The Dashboard provides a quick overview of your organization's asset management status.

### 3.1 Key Performance Indicators (KPIs)

The dashboard displays four main KPI cards:

| KPI | Description |
|-----|-------------|
| **Total Assets** | The total number of assets registered in the system |
| **Total Asset Value** | The cumulative purchase value of all assets (in Ksh) |
| **Total Expenses** | The total amount spent on asset-related expenses (in Ksh) |
| **Active Assignments** | The number of assets currently assigned to employees |

> **Note:** If your role has Branch Level Access enabled, the dashboard will only show data from your accessible branches.

### 3.2 Charts and Visualizations

The dashboard includes several interactive charts:

1. **Assets by Type**: Pie chart showing distribution of assets by category
2. **Assets by Status**: Chart displaying assets grouped by their current status
3. **Assets Distribution by Branch**: Bar chart showing asset distribution across branches
4. **Monthly Expenses Trend**: Line chart showing expense patterns over time

### 3.3 Recent Activity Tables

- **Recent Expenses**: Shows the latest expense entries with date, asset, type, vendor, and amount
- **Recent Assignments**: Displays the latest asset assignments

---

## 4. Asset Management

### 4.1 Creating a New Asset

To register a new asset in the system:

1. Navigate to **Assets** → **Create** from the sidebar
2. Fill in the required fields:

| Field | Description | Required |
|-------|-------------|----------|
| Asset Type | Select the category of the asset | Yes |
| Asset Tag | Auto-generated based on asset type | Auto |
| Manufacturer | Enter the manufacturer name | Yes |
| Model | Enter the model name/number | Yes |
| Serial Number | Enter the unique serial number | Yes |
| Status | Select the current status | Yes |
| Location | Select the branch/location | Yes |
| Purchase Date | Select the date of purchase | Yes |
| Purchase Price | Enter the purchase amount | Yes |
| Notes | Additional notes (optional) | No |

3. Click **Save Asset** to create the asset record
4. Click **Cancel** to clear the form

> **Note:** The Asset Tag is automatically generated based on the selected Asset Type. This ensures consistent naming conventions across the organization.

### 4.2 Viewing Assets

To view all registered assets:

1. Navigate to **Assets** → **View** from the sidebar
2. The asset list will display all assets in a table format

> **Branch Level Access:** If your role has branch level access enabled, you will only see assets from your assigned branch and its child branches.

#### Using Filters:

Use the filter options to narrow down the asset list:

- **Asset Tag**: Enter a specific asset tag
- **Serial Number**: Search by serial number
- **Asset Type**: Filter by asset category
- **Status**: Filter by asset status (In Stock, Assigned, Under Repair, etc.)
- **Location**: Filter by branch/location
- **Purchase Date Range**: Filter by purchase date period

Click **Search** to apply filters.

### 4.3 Viewing/Editing Asset Details

1. In the asset list, click **View/Edit** button for the desired asset
2. The asset detail form will be displayed
3. Make necessary changes to the editable fields
4. Click **Save Changes** to update the asset
5. Click **Cancel** to return to the list without saving

### 4.4 Viewing Assignment History

To view the assignment history of an asset:

1. In the asset list, click **History** button for the desired asset
2. A modal will display all past and current assignments for that asset
3. Information includes: Employee name, assignment date, return date, and notes

### 4.5 Deleting an Asset (Admin Only)

1. In the asset list, click **Delete** button for the asset
2. A confirmation dialog will appear
3. Click **Delete** to confirm deletion or **Cancel** to abort

> **Warning:** Deleting an asset is permanent and will remove all associated history. This action cannot be undone.

### 4.6 Asset Attachments

To add documents or images to an asset:

1. Open the asset details by clicking **View/Edit**
2. Scroll to the **Attachments** section
3. Click **Add Attachment** or drag and drop files
4. Supported file types: PDF, images (JPG, PNG), documents (DOC, DOCX)
5. Maximum file size: Check with your administrator

---

## 5. Assignment Management

### 5.1 Assigning an Asset (Admin Only)

To assign an asset to an employee:

1. Navigate to **Assignments** → **Assign** from the sidebar
2. Fill in the assignment form:

| Field | Description | Required |
|-------|-------------|----------|
| Asset | Select the asset to assign | Yes |
| Employee | Select the employee | Yes |
| Assignment Date | Select the assignment date | Yes |
| Notes | Additional notes about the assignment | No |

3. Click **Assign Asset** to complete the assignment

#### Branch Transfer:

If the asset and employee are in different branches:
- A dialog will appear asking about branch transfer
- Choose one of the options:
  - **Cancel Assignment**: Abort the assignment
  - **Assign Without Transfer**: Assign but keep asset at original branch
  - **Transfer & Assign**: Transfer asset to employee's branch and assign

### 5.2 Viewing Current Assignments

1. Navigate to **Assignments** → **View** from the sidebar
2. The current assignments table displays:
   - Asset information (tag, model, manufacturer)
   - Employee name
   - Assignment date
   - Notes
   - Actions (Return)

Use the search box to filter assignments by asset tag, model, employee, or notes.

### 5.3 Returning an Asset (Admin Only)

To return an assigned asset:

1. In the assignments list, click **Return** for the desired assignment
2. A return dialog will appear
3. Enter the **Return Date**
4. Add any **Return Notes** (optional)
5. Click **Return Asset** to complete the return process

> **Note:** The returned asset's status will automatically update to indicate it's available for reassignment.

### 5.4 Assignment Attachments

To add handover documents or other attachments:

1. Click **Attachments** button for the assignment
2. Upload relevant documents (handover forms, acknowledgment receipts, etc.)
3. View or download existing attachments

---

## 6. Expense Management

### 6.1 Creating an Expense Record

To record an asset-related expense:

1. Navigate to **Expenses** → **Create** from the sidebar
2. Fill in the expense form:

| Field | Description | Required |
|-------|-------------|----------|
| Asset | Select the asset | Yes |
| Assigned Employee | Auto-populated based on asset assignment | Auto |
| Expense Type | Select the type (Purchase, Repair, Logistics, etc.) | Yes |
| Date | Date of the expense | Yes |
| Amount | Expense amount in Ksh | Yes |
| Vendor | Name of the vendor/supplier | Yes |
| Invoice Number | Reference invoice number | Yes |
| Notes | Additional details (optional) | No |

3. Click **Save Expense** to record the expense

### 6.2 Viewing Expense History

1. The expense history table displays all recorded expenses
2. Use the search box to filter by asset, vendor, invoice number, or notes
3. The subtotal shows the sum of displayed expenses

#### Expense Table Information:

| Column | Description |
|--------|-------------|
| ID | Unique expense identifier |
| Asset | Asset tag and manufacturer |
| Model Name | Asset model |
| Date | Expense date |
| Vendor | Vendor/supplier name |
| Invoice # | Invoice reference number |
| Notes | Additional notes |
| Amount | Expense amount (Ksh) |
| Actions | View details and attachments |

### 6.3 Expense Attachments

To attach invoices or receipts:

1. Click **View/Attachments** for the expense
2. Click **Add Attachment** to upload files
3. Supported files: PDF, images, documents

---

## 7. Repair Requests

### 7.1 Overview

The Repair Request module allows users to submit requests for asset repairs and track their progress through a defined workflow.

### 7.2 Viewing Repair Requests

1. Navigate to **Repair Requests** → **All Requests** from the sidebar
2. View statistics cards showing:
   - Total Requests
   - Pending
   - In Progress
   - Completed

### 7.3 Filtering Requests

Use the filter options to find specific requests:

- **Status**: Filter by request status
- **Priority**: Filter by priority level
- **Type**: Filter by repair type
- **Branch**: Filter by branch/location
- **Search**: Free text search
- **My Requests Only**: Toggle to view only your submitted requests

Click **Filter** to apply or **Clear** to reset filters.

### 7.4 Creating a New Repair Request

1. Click the **New Request** button
2. Fill in the request form:

| Field | Description | Required |
|-------|-------------|----------|
| Title | Brief description of the issue | Yes |
| Asset | Select the asset needing repair | Yes |
| Type | Select the type of repair | Yes |
| Priority | Select urgency level | Yes |
| Description | Detailed description of the issue | Yes |

3. Click **Submit Request**

### 7.5 Understanding Request Status

| Status | Description |
|--------|-------------|
| Pending | Request submitted, awaiting review |
| Approved | Request approved, pending action |
| In Progress | Repair work in progress |
| Completed | Repair completed |
| Rejected | Request was rejected |
| Cancelled | Request was cancelled |

### 7.6 Request Workflow Actions

Depending on your role and the request status, you may have different actions available:

- **Approve**: Approve the request (Admin)
- **Reject**: Reject the request with reason
- **Start Work**: Begin repair work
- **Complete**: Mark repair as completed
- **Cancel**: Cancel the request

### 7.7 Viewing Request Details

1. Click on a request to view full details
2. View the complete request history and status changes
3. Add comments or attachments as needed

### 7.8 Repair Request Attachments

To attach diagnostic reports, photos, or other documents:

1. Open the request details
2. Navigate to the attachments section
3. Upload relevant files

---

## 8. Reports

### 8.1 Available Reports

The system provides several report types:

| Report | Description | Access |
|--------|-------------|--------|
| Assets Report | Comprehensive list of all assets with filters | Permission-based |
| Expenses Report | Detailed expense records with totals | Permission-based |
| Assignments Report | Asset assignment history | Permission-based |
| Repair Summary Report | Summary of repair requests | Permission-based |
| Action Logs Report | System activity audit trail | Admin Only |

### 8.2 Assets Report

1. Navigate to **Reports** → **Assets**
2. Apply filters as needed:
   - Asset Type
   - Status
   - Location/Branch
   - Purchase Date Range
3. Click **Generate Report**
4. Click **Export to Excel** to download the report

### 8.3 Expenses Report

1. Navigate to **Reports** → **Expenses**
2. Filter by:
   - Date Range
   - Expense Type
   - Asset
   - Vendor
3. Click **Generate Report**
4. View totals and export as needed

### 8.4 Assignments Report

1. Navigate to **Reports** → **Assignments**
2. Filter by:
   - Employee
   - Department
   - Branch
   - Date Range
3. Click **Generate Report**

### 8.5 Repair Summary Report

1. Navigate to **Reports** → **Repair Summary**
2. View summary statistics by:
   - Status
   - Priority
   - Type
   - Branch
3. Export for detailed analysis

### 8.6 Action Logs Report (Admin Only)

1. Navigate to **Reports** → **Action Logs**
2. View all system activities including:
   - User logins
   - Asset modifications
   - Assignment changes
   - Administrative actions
3. Filter by:
   - User
   - Action Type
   - Date Range
4. Export for audit purposes

### 8.7 Exporting Reports

All reports can be exported to Excel format:

1. Generate the desired report
2. Click **Export to Excel** button
3. The file will be downloaded to your computer
4. Open with Microsoft Excel or compatible software

---

## 9. Administration

> **Note:** This section is only accessible to users with Admin role or appropriate permissions.

### 9.1 User Management

#### Viewing Users:
1. Navigate to **Administration** → **Users**
2. View the list of all system users
3. Search users by name, email, or department

#### Adding a New User:
1. Click **Add New User**
2. Fill in the user information:
   - First Name, Last Name
   - Email Address
   - Phone Number
   - Department
   - Branch
   - Role
3. Click **Save**
4. The user will receive login credentials via email

#### Bulk User Import:
1. Click **Bulk Import**
2. Download the template if needed
3. Drag and drop or browse for your file (.xlsx, .xls, or .csv)
4. Click **Preview Data** to review
5. Review valid and invalid records
6. Click **Import Users** to complete

#### Editing a User:
1. Click **Edit** for the user
2. Modify the necessary fields
3. Click **Save Changes**

#### Resetting User Password:
1. Click **Reset Password** for the user
2. Confirm the action
3. A new password will be sent to the user's email

#### Activating/Deactivating a User:
1. Click **Toggle Status** for the user
2. Confirm the action
3. Deactivated users cannot log in

### 9.2 Role Management

1. Navigate to **Administration** → **Roles**
2. View existing roles and their descriptions

#### Adding a New Role:
1. Click **Add New Role**
2. Enter role name and description
3. Set active status
4. Click **Save Role**

#### Managing Role Permissions:
1. Click the **Permissions** button for a role
2. The permissions modal displays all modules
3. Configure permissions for each module (see Section 10)

#### Editing a Role:
1. Click **Edit** for the role
2. Modify the role details
3. Click **Save Changes**

#### Deleting a Role:
1. Click **Delete** for the role
2. Confirm deletion
> **Warning:** Roles with assigned users cannot be deleted

### 9.3 Branch Management

1. Navigate to **Administration** → **Branches**
2. View all branches/locations
3. Add new branches:
   - Click **Add Branch**
   - Enter branch name and location
   - Click **Save**
4. Edit or delete existing branches

### 9.4 Department Management

1. Navigate to **Administration** → **Departments**
2. View all departments
3. Add, edit, or delete departments as needed

### 9.5 Asset Types Management

1. Navigate to **Administration** → **Asset Types**
2. View existing asset types
3. Add new types:
   - Click **Add Type**
   - Enter type name and code
   - Set tag prefix for auto-generation
   - Click **Save**
4. Edit or delete existing types

### 9.6 Asset Status Management

1. Navigate to **Administration** → **Asset Statuses**
2. View existing statuses
3. Add new statuses or modify existing ones
4. Common statuses: In Stock, Assigned, Under Repair, Disposed

### 9.7 Expense Types Management

1. Navigate to **Administration** → **Expense Types**
2. Manage expense categories:
   - Purchase
   - Repair
   - Maintenance
   - Logistics
   - License
   - Other

### 9.8 Repair Configuration

#### Repair Types:
1. Navigate to **Administration** → **Repair Types**
2. Manage repair categories (Hardware, Software, etc.)

#### Repair Statuses:
1. Navigate to **Administration** → **Repair Statuses**
2. Configure status options for repair workflow

#### Repair Priorities:
1. Navigate to **Administration** → **Repair Priorities**
2. Set priority levels (Low, Medium, High, Critical)

---

## 10. Permissions Management

> **Note:** This section is only accessible to users with Admin role.

### 10.1 Overview

The Permissions Management feature allows administrators to configure granular access control for each role. You can specify which modules and actions each role can access.

### 10.2 Accessing Permissions Management

1. Navigate to **Administration** → **Permissions**
2. The permissions management page displays

### 10.3 Managing Permissions

#### Selecting a Role:
1. Use the role dropdown to select a role
2. Search for a role by typing in the search box
3. Click on the role to load its permissions

#### Permission Types:
For each module, you can configure:

| Permission | Description |
|------------|-------------|
| **Read** | View records in this module |
| **Create** | Add new records |
| **Update** | Modify existing records |
| **Delete** | Remove records |

#### Access Level Options:
| Option | Description |
|--------|-------------|
| **Branch Level Access** | User can only see data from their branch and child branches |
| **Company Level Access** | User can only see data from their assigned companies |

### 10.4 Configuring Permissions

1. Select a role from the dropdown
2. The permissions grid displays all modules
3. Check/uncheck permissions for each module:
   - Check **Read** to allow viewing
   - Check **Create** to allow adding
   - Check **Update** to allow editing
   - Check **Delete** to allow removing
4. Enable **Branch Level Access** if data should be branch-restricted
5. Enable **Company Level Access** if data should be company-restricted
6. Click **Save Permissions**

### 10.5 Quick Actions

- **Select All**: Grant all permissions for all modules
- **Clear All**: Remove all permissions

### 10.6 Permission Statistics

The sidebar shows:
- **Permissions**: Total number of granted permissions
- **Modules**: Number of modules with at least one permission

---

## 11. Branch Hierarchy

> **Note:** This section is only accessible to users with Admin role.

### 11.1 Overview

The Branch Hierarchy feature allows you to configure your organization's branch structure. This affects how data access is controlled across branches.

### 11.2 Understanding Branch Hierarchy

#### Key Concepts:

| Concept | Description |
|---------|-------------|
| **Headquarters (HQ)** | The main branch at the top of the hierarchy. Users in HQ can view data from all branches. |
| **Parent Branch** | A branch that has child branches under it. Can view data from all child branches. |
| **Child Branch** | A branch under a parent. Can only view its own data (unless it has children). |

#### How It Works:
- When a role has **Branch Level Access** enabled for a module, users can only see data within their accessible branches
- A branch can access data from:
  - Itself
  - All its descendant branches (children, grandchildren, etc.)
- HQ can access data from all branches

### 11.3 Accessing Branch Hierarchy

1. Navigate to **Administration** → **Branch Hierarchy**
2. The hierarchy configuration page displays

### 11.4 Viewing the Branch Tree

The left panel shows the organization structure as a tree:
- **HQ Badge**: Indicates which branch is the headquarters
- **Branch Icons**: Shows the branch hierarchy
- **Child Count**: Displays the number of child branches

### 11.5 Configuring a Branch

1. Click on a branch in the tree
2. The configuration panel shows branch details
3. Configure:

| Setting | Description |
|---------|-------------|
| **Parent Branch** | Select which branch this branch reports to |
| **Set as Headquarters** | Mark this branch as the main HQ |

### 11.6 Setting Up Hierarchy

#### Setting a Parent Branch:
1. Select a branch from the tree
2. Use the **Parent Branch** dropdown
3. Select the parent branch or "None" for root level
4. Click **Save Changes**

#### Setting Headquarters:
1. Select the branch to be HQ
2. Check **Set as Headquarters**
3. Click **Save Changes**
> **Note:** Only one branch can be headquarters at a time

### 11.7 Example Hierarchy

```
[HQ] Head Office
├── Regional Office East
│   ├── Branch A
│   └── Branch B
└── Regional Office West
    ├── Branch C
    └── Branch D
```

In this example:
- HQ can see all data
- Regional Office East can see data from Branch A and B
- Branch A can only see its own data

---

## 12. System Configuration

> **Note:** This section is only accessible to users with Admin role.

### 12.1 Accessing System Configuration

Navigate to **Settings** → **System Configuration**

### 12.2 General Settings

1. Select the **General Settings** tab
2. Configure:
   - **Application Name**: The name displayed in the header and login page
3. Click **Save Changes**

### 12.3 Company Information

1. Select the **Company Information** tab
2. Configure:
   - **Company Logo**: Upload your organization's logo (recommended: 200x60px, max 5MB)
   - **Company Email**: Official contact email
   - **Company Phone**: Contact phone number
   - **Company Address**: Physical address
3. Click **Save Changes**

### 12.4 Email Settings

1. Select the **Email Settings** tab
2. Configure SMTP settings for system emails:
   - **SMTP Host**: e.g., smtp.gmail.com
   - **SMTP Port**: 587 (TLS) or 465 (SSL)
   - **Use SSL/TLS**: Enable for secure connection
   - **SMTP Username**: Email address for authentication
   - **SMTP Password**: Password or app-specific password
   - **From Name**: Sender name for emails
   - **From Email**: Sender email address
3. Click **Test Connection** to verify settings
4. Click **Save Changes**

### 12.5 Security Settings

1. Select the **Security & Users** tab
2. Configure:
   - Password policies
   - Session timeout settings
   - Login attempt limits

### 12.6 Storage Settings

1. Select the **Storage Settings** tab
2. Configure file storage options:
   - Local storage path
   - Firebase storage (if applicable)
   - Maximum file size limits

---

## 13. Troubleshooting

### 13.1 Common Issues and Solutions

#### Cannot Log In

**Problem:** Unable to log in with correct credentials.

**Solutions:**
1. Verify you're using the correct email address
2. Check that Caps Lock is not enabled
3. Contact your administrator to:
   - Verify your account is active
   - Reset your password

#### Access Denied (403)

**Problem:** Seeing "Access Denied" when trying to access a feature.

**Solutions:**
1. Your role doesn't have permission for this module
2. Contact your administrator to request access
3. Ensure you're logged in with the correct account

#### Session Expired

**Problem:** Automatically logged out or "Session Expired" message.

**Solution:**
- This is normal after a period of inactivity
- Simply log in again to continue

#### Page Not Loading

**Problem:** Pages are slow or not loading.

**Solutions:**
1. Check your internet connection
2. Clear your browser cache
3. Try a different browser
4. Contact your IT support

#### Cannot See Expected Data

**Problem:** Missing data that should be visible.

**Solutions:**
1. Check if you have **Branch Level Access** enabled - you may only see data from your branch
2. Verify the data exists in your assigned branch
3. Check with your administrator about your permission settings

#### Cannot Upload Files

**Problem:** File upload fails or shows error.

**Solutions:**
1. Check file size limits
2. Ensure file type is supported
3. Try a smaller file
4. Check your internet connection

#### Export Not Working

**Problem:** Cannot download exported reports.

**Solutions:**
1. Check if pop-up blocker is enabled
2. Ensure you have permission to download files
3. Try a different browser

### 13.2 Getting Help

If you encounter issues not covered in this manual:

1. **Contact Your Administrator**: For user account issues, permissions, or system access
2. **IT Support**: For technical issues with the system
3. **Training**: Request additional training sessions if needed

### 13.3 Best Practices

1. **Regular Logout**: Always log out when leaving your workstation
2. **Accurate Data Entry**: Double-check information before saving
3. **Timely Updates**: Record asset changes, assignments, and expenses promptly
4. **Attachments**: Upload supporting documents for audit trail
5. **Report Regularly**: Generate reports periodically for monitoring
6. **Check Permissions**: If you can't access something, verify your role's permissions

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Submit form / Confirm action |
| Escape | Close modal / Cancel action |
| Tab | Navigate between fields |

## Appendix B: Status Reference

### Asset Statuses

| Status | Description | Color |
|--------|-------------|-------|
| In Stock | Available for assignment | Green |
| Assigned | Currently assigned to employee | Blue |
| Under Repair | Being repaired | Orange |
| Disposed | No longer in use | Red |
| In Transit | Being transferred | Yellow |

### Repair Request Statuses

| Status | Description |
|--------|-------------|
| Pending | Awaiting review |
| Approved | Approved for repair |
| In Progress | Repair ongoing |
| Completed | Repair finished |
| Rejected | Request denied |
| Cancelled | Request cancelled |

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| Asset | Any item of value owned by the organization |
| Asset Tag | Unique identifier for an asset |
| Assignment | Allocation of an asset to an employee |
| Branch | Physical location or office |
| Branch Hierarchy | Parent-child relationships between branches |
| Branch Level Access | Permission setting that restricts data to user's branch |
| Company Level Access | Permission setting that restricts data to user's companies |
| Department | Organizational unit or division |
| Expense | Financial cost associated with an asset |
| HQ (Headquarters) | Main branch at top of hierarchy |
| Module | Functional area of the system (Assets, Reports, etc.) |
| Permission | Access right to perform actions in a module |
| Repair Request | Formal request for asset repair |
| Role | User classification with specific permissions |
| Workflow | Defined process for approvals |

## Appendix D: Permission Module Codes

| Module Code | Description |
|-------------|-------------|
| DASHBOARD | Dashboard access |
| ASSETS | Asset management |
| ASSETS_CREATE | Create new assets |
| ASSETS_VIEW | View assets list |
| ASSIGNMENTS | Assignment management |
| ASSIGNMENTS_VIEW | View assignments |
| ASSIGNMENTS_ASSIGN | Assign assets |
| EXPENSES | Expense management |
| EXPENSES_CREATE | Create expenses |
| REPAIR_REQUESTS | Repair request management |
| REPAIR_REQUESTS_LIST | View all repair requests |
| REPAIR_REQUESTS_NEW | Create new repair requests |
| REPAIR_REQUESTS_WORKFLOW | Configure repair workflow |
| REPORTS | Reports access |
| REPORTS_ASSETS | Assets report |
| REPORTS_EXPENSES | Expenses report |
| REPORTS_ASSIGNMENTS | Assignments report |
| REPORTS_REPAIR_SUMMARY | Repair summary report |
| REPORTS_ACTION_LOGS | Action logs report |
| ADMINISTRATION | Administration access |
| ADMIN_USERS | User management |
| ADMIN_ROLES | Role management |
| ADMIN_PERMISSIONS | Permissions management |
| ADMIN_BRANCHES | Branch management |
| ADMIN_DEPARTMENTS | Department management |
| SETTINGS | System settings |
| SETTINGS_SYSTEM | System configuration |

---

**End of User Manual**

*For technical API documentation, please refer to the API_DOCUMENTATION.md file.*

*© 2026 JSL-ICT. All rights reserved.*
