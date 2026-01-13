import { Request } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { AssetModel, EmployeeModel } from '../models';
import db from '../config/database';
import logger from '../utils/logger';

const upload = multer({ storage: multer.memoryStorage() });

export class BulkUploadService {
  async processAssetUpload(file: Express.Multer.File) {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Assuming the first row is headers
      const headers = jsonData[0] as string[];
      const assetsToCreate = (jsonData.slice(1) as any[]).map(row => {
        const asset: any = {};
        headers.forEach((header, index) => {
          asset[header.trim().toLowerCase().replace(/ /g, '_')] = row[index];
        });
        return asset;
      });

      for (const asset of assetsToCreate) {
        await AssetModel.create(asset);
      }

      return { success: true, count: assetsToCreate.length };
    } catch (error) {
      logger.error('Bulk asset upload failed:', error);
      throw new Error('Failed to process bulk upload file.');
    }
  }

  /**
   * Process bulk employee upload from Excel file
   * Expected columns: First Name, Middle Name, Last Name, Company, Branch, Department
   */
  async processEmployeeUpload(file: Express.Multer.File) {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Get headers from first row
      const headers = (jsonData[0] as string[]).map(h => 
        h?.toString().trim().toLowerCase().replace(/ /g, '_') || ''
      );
      
      // Map column names to expected fields
      const columnMapping: Record<string, string> = {
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
      const branchesResult = await db.query('SELECT id, name FROM branches');
      const departmentsResult = await db.query('SELECT id, name FROM departments');
      
      const branchMap = new Map(branchesResult.rows.map(b => [b.name.toLowerCase(), b]));
      const departmentMap = new Map(departmentsResult.rows.map(d => [d.name.toLowerCase(), d]));

      const employeesToCreate: any[] = [];
      const errors: string[] = [];

      // Process each row (skip header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;

        const employee: any = {};
        
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
          const matchedCompany = validCompanies.find(c => 
            c.toLowerCase() === employee.company.toLowerCase()
          );
          if (matchedCompany) {
            employee.company = matchedCompany;
          } else {
            employee.company = 'Jirani'; // Default
          }
        } else {
          employee.company = 'Jirani'; // Default
        }

        // Look up branch
        if (employee.branch) {
          const branch = branchMap.get(employee.branch.toLowerCase());
          if (branch) {
            employee.branch_id = branch.id;
            employee.branch_location = branch.name;
          } else {
            errors.push(`Row ${i + 1}: Branch '${employee.branch}' not found`);
            continue;
          }
        } else {
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
      const createdEmployees = await EmployeeModel.bulkCreate(employeesToCreate);

      return { 
        success: true, 
        count: createdEmployees.length,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error: any) {
      logger.error('Bulk employee upload failed:', error);
      throw new Error(error.message || 'Failed to process employee bulk upload file.');
    }
  }

  /**
   * Generate a sample template for employee bulk upload
   */
  generateEmployeeTemplate(): Buffer {
    const workbook = xlsx.utils.book_new();
    
    const headers = ['First Name', 'Middle Name', 'Last Name', 'Company', 'Branch', 'Department'];
    const sampleData = [
      headers,
      ['Fred', 'Michael', 'K', 'Jirani', 'Head Office', 'IT'],
      ['Jane', '', 'Chelangat', 'Atana', 'Branch 1', 'Finance'],
      ['Example', 'E', 'Employee', 'Jirani Smart', 'Head Office', 'HR']
    ];
    
    const worksheet = xlsx.utils.aoa_to_sheet(sampleData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }
    ];
    
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
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
    const companiesSheet = xlsx.utils.aoa_to_sheet(companiesData);
    xlsx.utils.book_append_sheet(workbook, companiesSheet, 'Companies Reference');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

export { upload };
export default new BulkUploadService();