"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const models_1 = require("../models");
const bulkUserImport_model_1 = __importDefault(require("../models/bulkUserImport.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const crypto_1 = __importDefault(require("crypto"));
class BulkUserImportService {
    constructor() {
        this.SALT_ROUNDS = 10;
    }
    /**
     * Generate a secure random password
     */
    generatePassword(length = 12) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%&*';
        const allChars = lowercase + uppercase + numbers + symbols;
        let password = '';
        // Ensure at least one of each type
        password += lowercase[crypto_1.default.randomInt(lowercase.length)];
        password += uppercase[crypto_1.default.randomInt(uppercase.length)];
        password += numbers[crypto_1.default.randomInt(numbers.length)];
        password += symbols[crypto_1.default.randomInt(symbols.length)];
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += allChars[crypto_1.default.randomInt(allChars.length)];
        }
        // Shuffle the password
        return password.split('').sort(() => crypto_1.default.randomInt(3) - 1).join('');
    }
    /**
     * Parse Excel file and return preview data
     */
    async parseExcelFile(fileBuffer) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        return this.validateAndTransformData(rawData);
    }
    /**
     * Parse CSV file and return preview data
     */
    async parseCsvFile(fileBuffer) {
        const csvContent = fileBuffer.toString('utf-8');
        const workbook = XLSX.read(csvContent, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        return this.validateAndTransformData(rawData);
    }
    /**
     * Validate and transform raw data
     */
    async validateAndTransformData(rawData) {
        const valid = [];
        const invalid = [];
        const seenEmails = new Set();
        // Column mapping for flexible header names
        const columnMappings = {
            'first_name': 'first_name',
            'firstname': 'first_name',
            'first name': 'first_name',
            'middle_name': 'middle_name',
            'middlename': 'middle_name',
            'middle name': 'middle_name',
            'last_name': 'last_name',
            'lastname': 'last_name',
            'last name': 'last_name',
            'surname': 'last_name',
            'email': 'email',
            'email address': 'email',
            'phone': 'phone',
            'phone number': 'phone',
            'mobile': 'phone',
            'role_id': 'role_id',
            'role': 'role_id',
            'department': 'department',
            'department_name': 'department',
            'branch': 'branch_location',
            'branch_location': 'branch_location',
            'branch name': 'branch_location',
            'location': 'branch_location',
            'company': 'company'
        };
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            const errors = [];
            const transformedRow = {};
            // Transform column names
            for (const [key, value] of Object.entries(row)) {
                const normalizedKey = key.toLowerCase().trim();
                const mappedKey = columnMappings[normalizedKey] || normalizedKey;
                transformedRow[mappedKey] = typeof value === 'string' ? value.trim() : value;
            }
            // Validate required fields
            if (!transformedRow.first_name) {
                errors.push('First name is required');
            }
            if (!transformedRow.last_name) {
                errors.push('Last name is required');
            }
            if (!transformedRow.email) {
                errors.push('Email is required');
            }
            else {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(transformedRow.email)) {
                    errors.push('Invalid email format');
                }
                else if (seenEmails.has(transformedRow.email.toLowerCase())) {
                    errors.push('Duplicate email in file');
                }
                else {
                    seenEmails.add(transformedRow.email.toLowerCase());
                    // Check if email already exists in database
                    const existingUser = await models_1.UserModel.findByEmail(transformedRow.email);
                    if (existingUser) {
                        errors.push('Email already exists in the system');
                    }
                }
            }
            // Default role_id to 2 (Standard User) if not specified
            if (!transformedRow.role_id) {
                transformedRow.role_id = 2;
            }
            else {
                transformedRow.role_id = parseInt(transformedRow.role_id) || 2;
            }
            // Look up department by name
            if (transformedRow.department) {
                const dept = await models_1.DepartmentModel.findByName(transformedRow.department);
                if (dept) {
                    transformedRow.department_id = dept.id;
                    transformedRow.department = dept.name;
                }
                else {
                    errors.push(`Department "${transformedRow.department}" not found in the system`);
                }
            }
            // Look up branch by name
            if (transformedRow.branch_location) {
                const branch = await models_1.LocationModel.findByName(transformedRow.branch_location);
                if (branch) {
                    transformedRow.branch_id = branch.id;
                    transformedRow.branch_location = branch.name || branch.location;
                }
                else {
                    errors.push(`Branch "${transformedRow.branch_location}" not found in the system`);
                }
            }
            // Look up company by name - default to 'Jirani Smart' if not specified
            if (transformedRow.company) {
                const company = await models_1.EmployeeModel.findCompanyByName(transformedRow.company);
                if (company) {
                    transformedRow.company_id = company.id;
                    transformedRow.company = company.name;
                }
                else {
                    errors.push(`Company "${transformedRow.company}" not found in the system`);
                }
            }
            else {
                // Default to 'Jirani Smart' if no company specified
                const defaultCompany = await models_1.EmployeeModel.getDefaultCompany();
                if (defaultCompany) {
                    transformedRow.company_id = defaultCompany.id;
                    transformedRow.company = defaultCompany.name;
                }
            }
            if (errors.length > 0) {
                invalid.push({ row: i + 2, data: transformedRow, errors }); // +2 for header and 0-index
            }
            else {
                valid.push(transformedRow);
            }
        }
        return {
            valid,
            invalid,
            totalRows: rawData.length
        };
    }
    /**
     * Process the bulk import
     */
    async processImport(users, importType, performingUserId) {
        // Create import batch
        const batch = await bulkUserImport_model_1.default.createBatch(performingUserId, importType, users.length);
        let successfulRecords = 0;
        let failedRecords = 0;
        const details = [];
        for (const userData of users) {
            const client = await database_1.default.connect();
            const plainPassword = this.generatePassword();
            try {
                await client.query('BEGIN');
                // Check again for existing email (race condition protection)
                const existingUser = await models_1.UserModel.findByEmail(userData.email);
                if (existingUser) {
                    throw new Error('Email already exists');
                }
                // Create employee record
                const newEmployee = await models_1.EmployeeModel.create({
                    first_name: userData.first_name,
                    middle_name: userData.middle_name || '',
                    last_name: userData.last_name,
                    email: userData.email,
                    department: userData.department || '',
                    department_id: userData.department_id,
                    branch_location: userData.branch_location || '',
                    branch_id: userData.branch_id,
                    company: userData.company || 'Jirani'
                });
                // Hash password
                const hashedPassword = await bcryptjs_1.default.hash(plainPassword, this.SALT_ROUNDS);
                // Create user record with bulk import flag
                const createUserQuery = `
                    INSERT INTO users (employee_id, first_name, middle_name, last_name, email, password, 
                                       role_id, department_id, phone, branch_id, company_id, is_active, is_bulk_imported, is_password_changed)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, true, false)
                    RETURNING id, employee_id, first_name, middle_name, last_name, email, phone;
                `;
                const userResult = await client.query(createUserQuery, [
                    newEmployee.id,
                    userData.first_name,
                    userData.middle_name || '',
                    userData.last_name,
                    userData.email,
                    hashedPassword,
                    userData.role_id,
                    userData.department_id || null,
                    userData.phone || '',
                    userData.branch_id || null,
                    userData.company_id || null
                ]);
                const newUser = userResult.rows[0];
                await client.query('COMMIT');
                // Record in bulk imported users (after commit so user_id is visible to other connections)
                await bulkUserImport_model_1.default.addImportedUser({
                    bulk_import_id: batch.id,
                    user_id: newUser.id,
                    employee_id: newEmployee.id,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    auto_generated_password: plainPassword, // Store plain password for viewing
                    import_status: 'success'
                });
                // Log action
                await actionLog_service_1.default.logAction(performingUserId, 'BULK_IMPORT', 'User', newUser.id, { email: userData.email, batch_id: batch.id });
                successfulRecords++;
                details.push({
                    email: userData.email,
                    status: 'success',
                    password: plainPassword
                });
            }
            catch (error) {
                await client.query('ROLLBACK');
                logger_1.default.error(`Failed to import user ${userData.email}:`, error);
                // Record failure
                await bulkUserImport_model_1.default.addImportedUser({
                    bulk_import_id: batch.id,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    auto_generated_password: plainPassword,
                    import_status: 'failed',
                    error_message: error.message
                });
                failedRecords++;
                details.push({
                    email: userData.email,
                    status: 'failed',
                    error: error.message
                });
            }
            finally {
                client.release();
            }
        }
        // Update batch status
        await bulkUserImport_model_1.default.updateBatchStatus(batch.id, 'completed', successfulRecords, failedRecords);
        return {
            batchId: batch.id,
            totalRecords: users.length,
            successfulRecords,
            failedRecords,
            details
        };
    }
    /**
     * Generate Excel template for bulk user import
     */
    async generateTemplate() {
        const workbook = XLSX.utils.book_new();
        const templateData = [
            {
                'First Name': 'Fred',
                'Middle Name': 'M',
                'Last Name': 'K',
                'Email': 'fred.k@example.com',
                'Phone': '0712345678',
                'Role ID': 2, // 1=Admin, 2=Standard User
                'Department': 'IT',
                'Branch': 'Nairobi',
                'Company': 'Jirani'
            },
            {
                'First Name': 'Jane',
                'Middle Name': '',
                'Last Name': 'Chelangat',
                'Email': 'jane.chelangat@example.com',
                'Phone': '0798765432',
                'Role ID': 2,
                'Department': 'Finance',
                'Branch': 'Mombasa',
                'Company': 'Atana'
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        // Set column widths
        worksheet['!cols'] = [
            { wch: 15 }, // First Name
            { wch: 15 }, // Middle Name
            { wch: 15 }, // Last Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 10 }, // Role ID
            { wch: 20 }, // Department
            { wch: 20 }, // Branch
            { wch: 15 } // Company
        ];
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Template');
        // Add instructions sheet
        const instructionsData = [
            { 'Instructions': 'Bulk User Import Template Instructions' },
            { 'Instructions': '' },
            { 'Instructions': 'Required Fields:' },
            { 'Instructions': '- First Name: User\'s first name' },
            { 'Instructions': '- Last Name: User\'s last name' },
            { 'Instructions': '- Email: Must be unique, will be used as username' },
            { 'Instructions': '' },
            { 'Instructions': 'Optional Fields:' },
            { 'Instructions': '- Middle Name: User\'s middle name' },
            { 'Instructions': '- Phone: Contact number' },
            { 'Instructions': '- Role ID: 1=Admin, 2=Standard User (default: 2)' },
            { 'Instructions': '- Department: Department name (must exist in the system)' },
            { 'Instructions': '- Branch: Branch name (must exist in the system)' },
            { 'Instructions': '- Company: Jirani, Atana, Caretaker, Samani, Jirani Smart, Jirani Energies' },
            { 'Instructions': '' },
            { 'Instructions': 'Notes:' },
            { 'Instructions': '- Passwords will be auto-generated for all users' },
            { 'Instructions': '- Delete the sample rows before importing' },
            { 'Instructions': '- Save file as .xlsx or .csv format' }
        ];
        const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
        instructionsSheet['!cols'] = [{ wch: 60 }];
        XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return Buffer.from(buffer);
    }
    /**
     * Get all import batches
     */
    async getAllBatches(limit = 20, offset = 0) {
        return bulkUserImport_model_1.default.getAllBatches(limit, offset);
    }
    /**
     * Get batch details with imported users
     */
    async getBatchDetails(batchId) {
        const batch = await bulkUserImport_model_1.default.getBatchById(batchId);
        if (!batch) {
            throw new Error('Import batch not found');
        }
        const users = await bulkUserImport_model_1.default.getImportedUsersByBatchId(batchId);
        return { batch, users };
    }
    /**
     * Get batch details with paginated imported users
     */
    async getBatchDetailsPaginated(batchId, options) {
        const batch = await bulkUserImport_model_1.default.getBatchById(batchId);
        if (!batch) {
            throw new Error('Import batch not found');
        }
        const { users, totalCount } = await bulkUserImport_model_1.default.getImportedUsersByBatchIdPaginated(batchId, options);
        return { batch, users, totalCount };
    }
    /**
     * Get bulk import info for a specific user
     */
    async getBulkImportInfoByUserId(userId) {
        return bulkUserImport_model_1.default.getBulkImportInfoByUserId(userId);
    }
    /**
     * Mark password as changed for a user
     */
    async markPasswordChanged(userId) {
        return bulkUserImport_model_1.default.markPasswordChanged(userId);
    }
}
exports.default = new BulkUserImportService();
