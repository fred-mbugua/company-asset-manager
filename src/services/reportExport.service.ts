import * as ExcelJS from 'exceljs';
import {AssetModel, AssetReportModel, ExpenseReportModel, AssignmentReportModel} from '../models'; // Assuming you have a model for fetching report data

/**
 * Interface for the report data (adapt to your actual asset structure)
 */
interface AssetReportData {
    id: number;
    asset_tag: string;
    type_name: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    status_name: string;
    location: string;
    purchase_date: Date;
}

export class ReportExportService {

    /**
     * Generates an Excel workbook buffer for the Asset Report.
     * @param filters - The search/filter criteria from the request query.
     * @returns A Promise resolving to the Excel file buffer.
     */
    async generateAssetReport(filters: any): Promise<Buffer> {
        //  Fetch all data based on filters (NO pagination limit/offset)
        const data: AssetReportData[] = await AssetReportModel.findAllFiltered(filters);

        //  Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Asset Report');

        //  Define Columns (The headers and keys for mapping data)
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Asset Tag', key: 'asset_tag', width: 15 },
            { header: 'Type', key: 'type_name', width: 20 },
            { header: 'Manufacturer', key: 'manufacturer', width: 20 },
            { header: 'Model', key: 'model', width: 20 },
            { header: 'Serial Number', key: 'serial_number', width: 25 },
            { header: 'Status', key: 'status_name', width: 15 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Purchase Date', key: 'purchase_date', width: 15 }
        ];

        // Style the Header Row
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '28a745' } // green fill
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        //  Adding Data Rows
        data.forEach(asset => {
            // Formatting date correctly for Excel
            const formattedAsset = {
                ...asset,
                purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'
            };
            worksheet.addRow(formattedAsset);
        });
        
        //  Generating Buffer
        const arrayBufferOrBuffer = await workbook.xlsx.writeBuffer();
        // If ExcelJS returned a Node Buffer use it directly, otherwise convert the ArrayBuffer/Uint8Array to a Node Buffer
        const buffer = Buffer.isBuffer(arrayBufferOrBuffer)
            ? arrayBufferOrBuffer
            : Buffer.from(arrayBufferOrBuffer as ArrayBufferLike);
        return buffer;
    }

    /**
     * Generating an Excel workbook buffer for the Expense Report.
     */
    async generateExpenseReport(filters: any): Promise<Buffer> {
        const data = await ExpenseReportModel.findAllFiltered(filters); 
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Expenses Report');

        // Defining Columns (Headers must match the frontend table and model fields)
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Asset Tag', key: 'asset_tag', width: 15 },
            { header: 'Expense Type', key: 'expense_type_name', width: 20 },
            { header: 'Date', key: 'expense_date', width: 15 },
            // Using Excel number format for currency consistency
            { header: 'Amount', key: 'amount', width: 15, style: { numFmt: '"$"#,##0.00' } }, 
            { header: 'Vendor', key: 'vendor', width: 20 },
            { header: 'Invoice No.', key: 'invoice_no', width: 15 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Notes', key: 'notes', width: 40 },
        ];
        
        // Style the Header Row
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '28a745' } // green fill
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        //  Add Data Rows
        data.forEach(expense => {
            const formattedExpense = {
                ...expense,
                // Ensure date is string formatted for readability
                expense_date: expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A', 
            };
            worksheet.addRow(formattedExpense);
        });
        
        //  Generating Buffer
        const arrayBufferOrBuffer = await workbook.xlsx.writeBuffer();
        // If ExcelJS returned a Node Buffer use it directly, otherwise convert the ArrayBuffer/Uint8Array to a Node Buffer
        const buffer = Buffer.isBuffer(arrayBufferOrBuffer)
            ? arrayBufferOrBuffer
            : Buffer.from(arrayBufferOrBuffer as ArrayBufferLike);
        return buffer;
    }

    /**
     * Generates an Excel workbook buffer for the Assignment Report.
     */
    async generateAssignmentReport(filters: any): Promise<Buffer> {
        const data = await AssignmentReportModel.findAllFiltered(filters); 
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Assignment Report');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Asset Tag', key: 'asset_tag', width: 15 },
            { header: 'Manufacturer', key: 'manufacturer', width: 20 },
            { header: 'Model Name', key: 'model', width: 20 },
            { header: 'Employee', key: 'employee_name', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Assigned Date', key: 'assigned_date', width: 15 },
            { header: 'Return Date', key: 'returned_date', width: 15 },
            { header: 'Notes', key: 'notes', width: 40 },
        ];
        
        // Style the Header Row
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '28a745' } // green fill
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        data.forEach(assignment => {
            const formattedAssignment = {
                ...assignment,
                assigned_date: assignment.assignment_date ? new Date(assignment.assignment_date).toLocaleDateString() : 'N/A',
                returned_date: assignment.return_date ? new Date(assignment.return_date).toLocaleDateString() : 'Active',
                notes: assignment.notes || 'N/A',
            };
            worksheet.addRow(formattedAssignment);
        });
        
        //  Generating Buffer
        const arrayBufferOrBuffer = await workbook.xlsx.writeBuffer();
        // If ExcelJS returned a Node Buffer use it directly, otherwise convert the ArrayBuffer/Uint8Array to a Node Buffer
        const buffer = Buffer.isBuffer(arrayBufferOrBuffer)
            ? arrayBufferOrBuffer
            : Buffer.from(arrayBufferOrBuffer as ArrayBufferLike);
        return buffer;
    }
}

export default new ReportExportService();