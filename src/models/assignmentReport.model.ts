import db from '../config/database'; 

/**
 * Defining the structure for filtering parameters used in assignment report queries.
 */
interface IAssignmentReportFilters {
    asset_tag?: string;
    department?: string;
    employee_name?: string; 
    location?: string; // Branch name
    from_date?: string; // Filter on assignments.assignment_date >= from_date
    to_date?: string;   // Filter on assignments.assignment_date <= to_date
}

interface IReportQueryOptions {
    limit: number;
    offset: number;
}

interface AssignmentReportData {
    id: number;
    asset_tag: string;
    manufacturer: string;
    model: string;
    employee_name: string;
    department: string;
    assignment_date: Date;
    return_date: Date | null;
    notes: string | null;
    purchase_price: number;
    company: string;
}

export class AssignmentReportModel {
    
    // Base SQL SELECT and FROM clauses for readability
    private readonly BASE_QUERY_SELECT = `
        SELECT
            assignments.id,
            assets.asset_tag,
            assets.manufacturer,
            assets.model,
            assets.purchase_price,
            employees.department,
            employees.company,
            assignments.assignment_date,
            assignments.return_date,
            assignments.notes,
            employees.first_name || ' ' || employees.last_name AS employee_name,
            branches.name AS location
        FROM assignments
        INNER JOIN assets ON assignments.asset_id = assets.id
        INNER JOIN employees ON assignments.employee_id = employees.id
        INNER JOIN branches ON assets.branch_id = branches.id -- Join branch for location filter
    `;

    // --- Helper function to build the dynamic WHERE clause ---
    private buildWhereClause(filters: IAssignmentReportFilters, values: any[]): { where: string, nextIndex: number } {
        let where = 'WHERE 1=1';
        let paramIndex = values.length + 1;

        if (filters.asset_tag) {
            where += ` AND assets.asset_tag ILIKE $${paramIndex++}`;
            values.push(`%${filters.asset_tag}%`);
        }

        if (filters.department) {
            where += ` AND employees.department = $${paramIndex++}`;
            values.push(filters.department);
        }
        
        if (filters.employee_name) {
            where += ` AND (employees.first_name || ' ' || employees.last_name) ILIKE $${paramIndex++}`;
            values.push(`%${filters.employee_name}%`);
        }
        
        if (filters.location) {
            where += ` AND branches.name = $${paramIndex++}`;
            values.push(filters.location);
        }

        if (filters.from_date) {
            where += ` AND assignments.assignment_date >= $${paramIndex++}`;
            values.push(filters.from_date);
        }

        if (filters.to_date) {
            where += ` AND assignments.assignment_date <= $${paramIndex++}`;
            values.push(filters.to_date);
        }
        
        return { where, nextIndex: paramIndex };
    }


    /**
     * Fetching paginated assignments and the total count.
     */
    async findPaginatedAndCount(filters: IAssignmentReportFilters, options: IReportQueryOptions): 
        Promise<{ assignments: AssignmentReportData[], totalCount: number }> 
    {
        const values: any[] = [];
        const { where, nextIndex } = this.buildWhereClause(filters, values);

        // Fetching Paginated Data
        const dataQuery = `
            ${this.BASE_QUERY_SELECT}
            ${where}
            ORDER BY assignments.assignment_date DESC
            LIMIT $${nextIndex} OFFSET $${nextIndex + 1};
        `;

        values.push(options.limit, options.offset);
        const assignmentsResult = await db.query(dataQuery, values);
        
        // Fetching Total Count
        const countQuery = `
            SELECT COUNT(assignments.id) AS total_count
            FROM assignments
            INNER JOIN assets ON assignments.asset_id = assets.id
            INNER JOIN employees ON assignments.employee_id = employees.id
            INNER JOIN branches ON assets.branch_id = branches.id
            ${where};
        `;
        const countValues = values.slice(0, values.length - 2); 
        const countResult = await db.query(countQuery, countValues);

        const totalCount = parseInt(countResult.rows[0].total_count, 10);
        
        return { assignments: assignmentsResult.rows, totalCount: totalCount };
    }
    
    /**
     * Fetching all filtered assignment records (used for export).
     */
    async findAllFiltered(filters: IAssignmentReportFilters): Promise<AssignmentReportData[]> {
        const values: any[] = [];
        const { where } = this.buildWhereClause(filters, values);

        const query = `
            ${this.BASE_QUERY_SELECT}
            ${where}
            ORDER BY assignments.assignment_date DESC;
        `;
        
        const result = await db.query(query, values);
        return result.rows;
    }
}

export default new AssignmentReportModel();
export { IAssignmentReportFilters }; // Export interface for use in Service/Controller