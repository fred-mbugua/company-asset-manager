import * as ExcelJS from 'exceljs';
import {AssetModel, AssetReportModel, ExpenseReportModel, AssignmentReportModel, ActionLogReportModel} from '../models'; // Assuming you have a model for fetching report data

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
            { header: 'Purchase Date', key: 'purchase_date', width: 15 },
            { header: 'Purchase Amount', key: 'purchase_price', width: 18, style: { numFmt: '#,##0.00' } }
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
            { header: 'Date', key: 'date', width: 15 },
            // Using Excel number format for currency consistency
            { header: 'Amount', key: 'amount', width: 15, style: { numFmt: '"$"#,##0.00' } }, 
            { header: 'Vendor', key: 'vendor', width: 20 },
            { header: 'Invoice No.', key: 'invoice_number', width: 15 },
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
                date: expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A', 
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
            { header: 'Assigned Date', key: 'assignment_date', width: 15 },
            { header: 'Return Date', key: 'return_date', width: 15 },
            { header: 'Purchase Amount', key: 'purchase_price', width: 18, style: { numFmt: '#,##0.00' } },
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
                assignment_date: assignment.assignment_date ? new Date(assignment.assignment_date).toLocaleDateString() : 'N/A',
                return_date: assignment.return_date ? new Date(assignment.return_date).toLocaleDateString() : 'Active',
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

    /**
     * Generates an Excel workbook buffer for the Action Log Report.
     */
    async generateActionLogReport(filters: any): Promise<Buffer> {
        const data = await ActionLogReportModel.findAllFiltered(filters); 
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Action Logs Report');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User', key: 'user_name', width: 20 },
            { header: 'Action Type', key: 'action_type', width: 15 },
            { header: 'Entity Type', key: 'entity_type', width: 15 },
            { header: 'Entity ID', key: 'entity_id', width: 12 },
            { header: 'Details', key: 'details', width: 40 },
            { header: 'Date & Time', key: 'created_at', width: 20 },
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

        data.forEach(log => {
            const formattedLog = {
                id: log.id,
                user_name: log.user_name || 'N/A',
                action_type: log.action_type,
                entity_type: log.entity_type,
                entity_id: log.entity_id || 'N/A',
                details: log.details ? JSON.stringify(log.details) : 'N/A',
                created_at: log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A',
            };
            worksheet.addRow(formattedLog);
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
     * Generating an Excel workbook buffer for the Repair Summary Report.
     */
    async generateRepairSummaryReport(filters: { from_date?: string; to_date?: string }): Promise<Buffer> {
        const result = await ExpenseReportModel.getRepairExpenseSummary(filters); 
        const data = result.data;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Repair Summary Report');

        worksheet.columns = [
            { header: 'Staff', key: 'staff_name', width: 25 },
            { header: 'Company', key: 'company', width: 18 },
            { header: 'Asset Tag', key: 'asset_tag', width: 15 },
            { header: 'Location', key: 'location', width: 18 },
            { header: 'Model', key: 'model', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Asset Type', key: 'asset_type', width: 18 },
            { header: 'Repair Count', key: 'repair_count', width: 12 },
            { header: 'Total Repair Amount', key: 'total_repair_amount', width: 20, style: { numFmt: '"KES "#,##0.00' } },
        ];
        
        // Style the Header Row
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'dc3545' } // red fill for repair/warning theme
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        data.forEach(item => {
            const formattedItem = {
                staff_name: item.staff_name || 'Unassigned',
                company: item.company || 'N/A',
                asset_tag: item.asset_tag,
                location: item.location || 'N/A',
                model: item.model || 'N/A',
                status: item.status,
                asset_type: item.asset_type,
                repair_count: parseInt(item.repair_count),
                total_repair_amount: parseFloat(item.total_repair_amount),
            };
            worksheet.addRow(formattedItem);
        });

        // Add total row
        if (data.length > 0) {
            const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.total_repair_amount), 0);
            const totalRow = worksheet.addRow({
                staff_name: 'TOTAL',
                total_repair_amount: totalAmount
            });
            totalRow.font = { bold: true };
        }
        
        //  Generating Buffer
        const arrayBufferOrBuffer = await workbook.xlsx.writeBuffer();
        const buffer = Buffer.isBuffer(arrayBufferOrBuffer)
            ? arrayBufferOrBuffer
            : Buffer.from(arrayBufferOrBuffer as ArrayBufferLike);
        return buffer;
    }
}

export default new ReportExportService();