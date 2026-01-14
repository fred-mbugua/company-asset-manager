"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.BulkUploadService = void 0;
const multer_1 = __importDefault(require("multer"));
const xlsx_1 = __importDefault(require("xlsx"));
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.upload = upload;
class BulkUploadService {
    async processAssetUpload(file) {
        try {
            const workbook = xlsx_1.default.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx_1.default.utils.sheet_to_json(worksheet, { header: 1 });
            // Assuming the first row is headers
            const headers = jsonData[0];
            const assetsToCreate = jsonData.slice(1).map(row => {
                const asset = {};
                headers.forEach((header, index) => {
                    asset[header.trim().toLowerCase().replace(/ /g, '_')] = row[index];
                });
                return asset;
            });
            for (const asset of assetsToCreate) {
                await models_1.AssetModel.create(asset);
            }
            return { success: true, count: assetsToCreate.length };
        }
        catch (error) {
            logger_1.default.error('Bulk asset upload failed:', error);
            throw new Error('Failed to process bulk upload file.');
        }
    }
    /**
     * Process bulk employee upload from Excel file
     * Expected columns: First Name, Middle Name, Last Name, Company, Branch, Department
     */
    async processEmployeeUpload(file) {
        try {
            const workbook = xlsx_1.default.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx_1.default.utils.sheet_to_json(worksheet, { header: 1 });
            // Get headers from first row
            const headers = jsonData[0].map(h => (h === null || h === void 0 ? void 0 : h.toString().trim().toLowerCase().replace(/ /g, '_')) || '');
            // Map column names to expected fields
            const columnMapping = {
                'first_name': 'first_name',
                'firstname': 'first_name',
                'first': 'first_name',
                'middle_name': 'middle_name',
                'middlename': 'middle_name',
                'middle': 'middle_name',
                'last_name': 'last_name',
                'lastname': 'last_name',
                'last': 'last_name',
                'surname': 'last_name',
                'company': 'company',
                'organization': 'company',
                'branch': 'branch',
                'location': 'branch',
                'branch_name': 'branch',
                'department': 'department',
                'dept': 'department'
            };
            // Valid companies
            const validCompanies = ['Jirani', 'Atana', 'Caretaker', 'Samani', 'Jirani Smart', 'Jirani Energies'];
            // Get all branches and departments for lookup
            const branchesResult = await database_1.default.query('SELECT id, name FROM branches');
            const departmentsResult = await database_1.default.query('SELECT id, name FROM departments');
            const branchMap = new Map(branchesResult.rows.map(b => [b.name.toLowerCase(), b]));
            const departmentMap = new Map(departmentsResult.rows.map(d => [d.name.toLowerCase(), d]));
            const employeesToCreate = [];
            const errors = [];
            // Process each row (skip header)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0)
                    continue;
                const employee = {};
                headers.forEach((header, index) => {
                    const mappedField = columnMapping[header];
                    if (mappedField && row[index] !== undefined && row[index] !== null) {
                        employee[mappedField] = row[index].toString().trim();
                    }
                });
                // Validate required fields
                if (!employee.first_name || !employee.last_name) {
                    errors.push(`Row ${i + 1}: First name and last name are required`);
                    continue;
                }
                // Validate and normalize company
                if (employee.company) {
                    const matchedCompany = validCompanies.find(c => c.toLowerCase() === employee.company.toLowerCase());
                    if (matchedCompany) {
                        employee.company = matchedCompany;
                    }
                    else {
                        employee.company = 'Jirani'; // Default
                    }
                }
                else {
                    employee.company = 'Jirani'; // Default
                }
                // Look up branch
                if (employee.branch) {
                    const branch = branchMap.get(employee.branch.toLowerCase());
                    if (branch) {
                        employee.branch_id = branch.id;
                        employee.branch_location = branch.name;
                    }
                    else {
                        errors.push(`Row ${i + 1}: Branch '${employee.branch}' not found`);
                        continue;
                    }
                }
                else {
                    errors.push(`Row ${i + 1}: Branch is required`);
                    continue;
                }
                // Look up department (optional)
                if (employee.department) {
                    const dept = departmentMap.get(employee.department.toLowerCase());
                    if (dept) {
                        employee.department_id = dept.id;
                        employee.department = dept.name;
                    }
                }
                employee.middle_name = employee.middle_name || '';
                employeesToCreate.push(employee);
            }
            if (employeesToCreate.length === 0) {
                throw new Error(`No valid employees to import. Errors: ${errors.join('; ')}`);
            }
            // Bulk create employees
            const createdEmployees = await models_1.EmployeeModel.bulkCreate(employeesToCreate);
            return {
                success: true,
                count: createdEmployees.length,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            logger_1.default.error('Bulk employee upload failed:', error);
            throw new Error(error.message || 'Failed to process employee bulk upload file.');
        }
    }
    /**
     * Generate a sample template for employee bulk upload
     */
    generateEmployeeTemplate() {
        const workbook = xlsx_1.default.utils.book_new();
        const headers = ['First Name', 'Middle Name', 'Last Name', 'Company', 'Branch', 'Department'];
        const sampleData = [
            headers,
            ['Fred', 'Michael', 'K', 'Jirani', 'Head Office', 'IT'],
            ['Jane', '', 'Chelangat', 'Atana', 'Branch 1', 'Finance'],
            ['Example', 'E', 'Employee', 'Jirani Smart', 'Head Office', 'HR']
        ];
        const worksheet = xlsx_1.default.utils.aoa_to_sheet(sampleData);
        // Set column widths
        worksheet['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }
        ];
        xlsx_1.default.utils.book_append_sheet(workbook, worksheet, 'Employees');
        // Add companies reference sheet
        const companiesData = [
            ['Valid Companies'],
            ['Jirani'],
            ['Atana'],
            ['Caretaker'],
            ['Samani'],
            ['Jirani Smart'],
            ['Jirani Energies']
        ];
        const companiesSheet = xlsx_1.default.utils.aoa_to_sheet(companiesData);
        xlsx_1.default.utils.book_append_sheet(workbook, companiesSheet, 'Companies Reference');
        return xlsx_1.default.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
exports.BulkUploadService = BulkUploadService;
exports.default = new BulkUploadService();
