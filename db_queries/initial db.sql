--
-- File: database-setup.sql
-- Description: PostgreSQL schema for the ICT Asset Management Application
--

-- Create ENUM types for fixed-value fields
CREATE TYPE asset_status AS ENUM ('In Use', 'In Stock', 'Under Repair', 'Disposed');
CREATE TYPE expense_type AS ENUM ('Purchase', 'Repair', 'Maintenance', 'Upgrade');
CREATE TYPE user_role AS ENUM ('Admin', 'Standard User');

-- Table: employees
-- Stores employee information, linked to user and assignment tables.
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    branch_location VARCHAR(255) NOT NULL,
    department VARCHAR(255)
);

-- Index for efficient lookups by branch location
CREATE INDEX idx_employees_location ON employees(branch_location);

-- Table: users
-- Stores user authentication and authorization data.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id INT UNIQUE REFERENCES employees(id) ON DELETE SET NULL, -- Optional link to employee data, unique constraint
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL
);

-- Index for efficient user lookups by email
CREATE INDEX idx_users_email ON users(email);

-- Table: assets
-- The core table for storing ICT asset details.
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(255) UNIQUE NOT NULL,
    asset_type VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    status asset_status NOT NULL,
    location VARCHAR(255) NOT NULL,
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    notes TEXT
);

-- Indexes to support search functionality and foreign key lookups
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_serial_number ON assets(serial_number);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_location ON assets(location);
CREATE INDEX idx_assets_purchase_price ON assets(purchase_price);


-- Table: assignments
-- Records the history of assets being assigned to employees.
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    assignment_date DATE NOT NULL,
    return_date DATE
);

-- Indexes for efficient lookups by asset and employee ID
CREATE INDEX idx_assignments_asset_id ON assignments(asset_id);
CREATE INDEX idx_assignments_employee_id ON assignments(employee_id);
-- Compound index for finding an employee's currently assigned assets
CREATE INDEX idx_assignments_current_asset ON assignments(employee_id, return_date) WHERE return_date IS NULL;

-- Table: expenses
-- Logs expenses associated with specific assets.
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE SET NULL, -- NULL on asset deletion to maintain history
    expense_type expense_type NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    vendor VARCHAR(255),
    invoice_number VARCHAR(255),
    notes TEXT
);

-- Index for efficient lookups by asset ID and date range
CREATE INDEX idx_expenses_asset_id ON expenses(asset_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- Table: refresh_tokens
-- Stores JWT refresh tokens for persistent sessions.
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL, -- Ensure tokens are unique
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for fast token lookups
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);