// src/services/reportExport.service.ts

import * as ExcelJS from 'exceljs';
import {AssetModel} from '../models'; // Assuming you have a model for fetching report data

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
    department: string;
    purchase_date: Date;
}

export class ReportExportService {

    /**
     * Generates an Excel workbook buffer for the Asset Report.
     * @param filters - The search/filter criteria from the request query.
     * @returns A Promise resolving to the Excel file buffer.
     */
    async generateAssetReport(filters: any): Promise<Buffer> {
        // 1. Fetch all data based on filters (NO pagination limit/offset)
        // Your report model method should handle all filtering and ordering
        const data: AssetReportData[] = await AssetModel.findAllFiltered(filters);

        // 2. Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Asset Report');

        // 3. Define Columns (The headers and keys for mapping data)
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Asset Tag', key: 'asset_tag', width: 15 },
            { header: 'Type', key: 'type_name', width: 20 },
            { header: 'Manufacturer', key: 'manufacturer', width: 20 },
            { header: 'Model', key: 'model', width: 20 },
            { header: 'Serial Number', key: 'serial_number', width: 25 },
            { header: 'Status', key: 'status_name', width: 15 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Purchase Date', key: 'purchase_date', width: 15 }
        ];

        // 4. Style the Header Row
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '1F4E78' } // Dark blue fill
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // 5. Add Data Rows
        data.forEach(asset => {
            // Format date correctly for Excel
            const formattedAsset = {
                ...asset,
                purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'
            };
            worksheet.addRow(formattedAsset);
        });
        
        // 6. Generate Buffer
        const arrayBufferOrBuffer = await workbook.xlsx.writeBuffer();
        // If ExcelJS returned a Node Buffer use it directly, otherwise convert the ArrayBuffer/Uint8Array to a Node Buffer
        const buffer = Buffer.isBuffer(arrayBufferOrBuffer)
            ? arrayBufferOrBuffer
            : Buffer.from(arrayBufferOrBuffer as ArrayBufferLike);
        return buffer;
    }
}

export default new ReportExportService();