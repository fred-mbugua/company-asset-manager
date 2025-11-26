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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportExportService = void 0;
const ExcelJS = __importStar(require("exceljs"));
const models_1 = require("../models"); // Assuming you have a model for fetching report data
class ReportExportService {
    /**
     * Generates an Excel workbook buffer for the Asset Report.
     * @param filters - The search/filter criteria from the request query.
     * @returns A Promise resolving to the Excel file buffer.
     */
    async generateAssetReport(filters) {
        //  Fetch all data based on filters (NO pagination limit/offset)
        const data = await models_1.AssetReportModel.findAllFiltered(filters);
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
            : Buffer.from(arrayBufferOrBuffer);
        return buffer;
    }
}
exports.ReportExportService = ReportExportService;
exports.default = new ReportExportService();
