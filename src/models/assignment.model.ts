// import pool from '../config/database';

// class AssignmentModel {
//   async create(assignmentData: { asset_id: string; employee_id: string }) {
//     const query = 'INSERT INTO assignments (asset_id, employee_id, assignment_date) VALUES ($1, $2, NOW()) RETURNING *';
//     const result = await pool.query(query, [assignmentData.asset_id, assignmentData.employee_id]);
//     return result.rows[0];
//   }

//   async findByAssetId(assetId: string) {
//     const query = 'SELECT a.*, e.full_name as employee_name FROM assignments a JOIN employees e ON a.employee_id = e.id WHERE a.asset_id = $1 ORDER BY assignment_date DESC';
//     const result = await pool.query(query, [assetId]);
//     return result.rows;
//   }

//   async findByEmployeeId(employeeId: string) {
//     const query = 'SELECT a.*, asst.asset_tag, asst.asset_type, asst.manufacturer, asst.model FROM assignments a JOIN assets asst ON a.asset_id = asst.id WHERE a.employee_id = $1 AND a.return_date IS NULL';
//     const result = await pool.query(query, [employeeId]);
//     return result.rows;
//   }

//   async returnAsset(assetId: string) {
//     const query = 'UPDATE assignments SET return_date = NOW() WHERE asset_id = $1 AND return_date IS NULL RETURNING *';
//     const result = await pool.query(query, [assetId]);
//     return result.rows[0];
//   }
// }

// export default new AssignmentModel();

import db from '../config/database';

class AssignmentModel {
    static async create(assignmentData: any) {
        // console.log('Creating assignment with data:', assignmentData);

        const query = `
            INSERT INTO assignments (asset_id, employee_id, assignment_date, return_date, notes)
            VALUES ($1, $2, NOW(), NULL, $3)
            RETURNING *;
        `;
        const values = [assignmentData.asset_id, assignmentData.employee_id, assignmentData.notes];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findAll() {
        const query = `Select
                            ass.id As id,
                            asts.asset_tag As asset_tag,
                            emps.first_name As employee_first_name,
                            emps.middle_name As employee_middle_name,
                            emps.last_name As employee_last_name,
                            ass.assignment_date As assignment_date,
                            ass.return_date As return_date,
                            ass.notes,
                            asts.model,
                            asts.serial_number,
                            asts.manufacturer,
                            asts.asset_type
                        From
                            assignments ass Inner Join
                            assets asts On ass.asset_id = asts.id Inner Join
                            employees emps On ass.employee_id = emps.id
                        Where
                            ass.return_date IS NULL
                        Order By
                            assignment_date Desc`;
        const result = await db.query(query);
        return result.rows;
    }

    static async findById(id: number) {
        const query = `
            SELECT 
                a.*,
                ast.asset_tag,
                ast.manufacturer,
                ast.model,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name
            FROM assignments a
            LEFT JOIN assets ast ON a.asset_id = ast.id
            LEFT JOIN employees e ON a.employee_id = e.id
            WHERE a.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id: number, updateData: any) {
        const query = `
            UPDATE assignments SET asset_id = COALESCE($1, asset_id), employee_id = COALESCE($2, employee_id), assignment_date = COALESCE($3, assignment_date), return_date = COALESCE($4, return_date), notes = COALESCE($5, notes)
            WHERE id = $6
            RETURNING *;
        `;
        const values = [updateData.asset_id, updateData.employee_id, updateData.assignment_date, updateData.return_date, updateData.notes, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id: number) {
        const query = `DELETE FROM assignments WHERE id = $1;`;
        await db.query(query, [id]);
        return true;
    }

    static async findActiveByAssetId(assetId: number) {
        const query = `
            SELECT * FROM assignments 
            WHERE asset_id = $1 AND return_date IS NULL;
        `;
        const result = await db.query(query, [assetId]);
        return result.rows[0];
    }

    static async findByEmployeeId(employeeId: string) {
        const query = `
            SELECT
                A.id,
                A.asset_tag,
                A.asset_type,
                A.manufacturer,
                A.model,
                A.serial_number,
                A.status,
                A.location,
                A.purchase_date,
                A.purchase_price,
                A.notes,
                E.id AS employee_id
            FROM
                assets AS A
            INNER JOIN
                assignments AS ASGN ON ASGN.asset_id = A.id
            INNER JOIN
                employees AS E ON ASGN.employee_id = E.id
            WHERE
                E.id = $1
            ORDER BY
                A.id DESC;
        `;
        const result = await db.query(query, [employeeId]);
        return result.rows;
    }

    static async getInStockStatus() {
        const query = `
            SELECT id, name FROM asset_statuses 
            WHERE LOWER(name) = 'in stock' 
            LIMIT 1;
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    static async getInUseStatus() {
        const query = `
            SELECT id, name FROM asset_statuses 
            WHERE LOWER(name) = 'in use' OR LOWER(name) = 'inuse'
            LIMIT 1;
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    static async updateAssetStatus(assetId: number, statusId: number, statusName: string) {
        const query = `
            UPDATE assets 
            SET asset_status_id = $1, status = $2
            WHERE id = $3
            RETURNING *;
        `;
        const result = await db.query(query, [statusId, statusName, assetId]);
        return result.rows[0];
    }

    static async getEmployeeById(employeeId: number) {
        const query = `
            SELECT 
                employees.*,
                branches.name AS branch_name,
                branches.location AS branch_location
            FROM employees
            LEFT JOIN branches ON employees.branch_id = branches.id
            WHERE employees.id = $1;
        `;
        const result = await db.query(query, [employeeId]);
        return result.rows[0];
    }

    static async getAssetHistory(assetId: number) {
        const query = `
            SELECT 
                ass.id,
                ass.assignment_date,
                ass.return_date,
                ass.notes,
                emps.first_name,
                emps.middle_name,
                emps.last_name,
                branches.name AS branch_name,
                branches.location AS branch_location,
                users.first_name AS assigned_by_first_name,
                users.last_name AS assigned_by_last_name
            FROM assignments ass
            INNER JOIN employees emps ON ass.employee_id = emps.id
            LEFT JOIN branches ON emps.branch_id = branches.id
            LEFT JOIN action_logs al ON al.entity_type = 'Assignment' AND al.entity_id = ass.id AND al.action_type = 'ASSIGN ASSET'
            LEFT JOIN users ON al.user_id = users.id
            WHERE ass.asset_id = $1
            ORDER BY ass.assignment_date DESC;
        `;
        const result = await db.query(query, [assetId]);
        return result.rows;
    }
}

export default AssignmentModel;