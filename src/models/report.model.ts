import pool from '../config/database';
import { AccessFilterContext } from '../utils/accessFilter.util';

/**
 * Access filter options for filtering data by branch and company
 */
interface AccessFilter {
  branchIds?: number[];
  companyIds?: number[];
}

/**
 * Build WHERE clause conditions for access filtering
 * Now includes company filtering via branches.company_id
 */
function buildAccessFilterConditions(
  filter: AccessFilter | undefined,
  config: {
    branchTable?: string;
    branchField?: string;
    employeeTable?: string;
    requiresBranchJoin?: boolean;  // Set to true if query needs to join to branches
  } = {},
  startParamIndex: number = 1
): { whereClause: string; values: any[]; nextParamIndex: number; needsBranchJoin: boolean } {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = startParamIndex;
  let needsBranchJoin = config.requiresBranchJoin || false;

  if (!filter) {
    return { whereClause: '', values: [], nextParamIndex: paramIndex, needsBranchJoin: false };
  }

  // Company filtering - ALWAYS apply first if present
  // This filters assets by the company their branch belongs to
  if (filter.companyIds && filter.companyIds.length > 0) {
    needsBranchJoin = true;  // We need branches table for company_id
    if (filter.companyIds.length === 1) {
      conditions.push(`branches.company_id = $${paramIndex}`);
      values.push(filter.companyIds[0]);
      paramIndex++;
    } else {
      const placeholders = filter.companyIds.map((_, i) => `$${paramIndex + i}`).join(', ');
      conditions.push(`branches.company_id IN (${placeholders})`);
      values.push(...filter.companyIds);
      paramIndex += filter.companyIds.length;
    }
  }

  // Branch filtering - additional filter within the company
  if (filter.branchIds && filter.branchIds.length > 0) {
    const branchTable = config.branchTable || 'assets';
    const branchField = config.branchField || 'branch_id';
    
    if (filter.branchIds.length === 1) {
      conditions.push(`${branchTable}.${branchField} = $${paramIndex}`);
      values.push(filter.branchIds[0]);
      paramIndex++;
    } else {
      const placeholders = filter.branchIds.map((_, i) => `$${paramIndex + i}`).join(', ');
      conditions.push(`${branchTable}.${branchField} IN (${placeholders})`);
      values.push(...filter.branchIds);
      paramIndex += filter.branchIds.length;
    }
  }

  const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '';
  return { whereClause, values, nextParamIndex: paramIndex, needsBranchJoin };
}

/**
 * Create access filter from permission context
 */
function createAccessFilter(AccessFilterContext?: AccessFilterContext): AccessFilter | undefined {
  if (!AccessFilterContext || AccessFilterContext.isAdmin) {
    return undefined;
  }

  const filter: AccessFilter = {};

  if (AccessFilterContext.branchLevelAccess && AccessFilterContext.accessibleBranchIds) {
    filter.branchIds = AccessFilterContext.accessibleBranchIds;
  }

  if (AccessFilterContext.companyLevelAccess && AccessFilterContext.accessibleCompanyIds) {
    filter.companyIds = AccessFilterContext.accessibleCompanyIds;
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

class ReportModel {
  /**
   * Get total asset value with optional access filtering
   */
  async getTotalAssetValue(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    const query = `
      SELECT COALESCE(SUM(purchase_price), 0) AS total_value 
      FROM assets
      ${branchJoin}
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;
    const result = await pool.query(query, values);
    return result.rows[0].total_value;
  }

  async getTotalValueByCategory(assetType: string, AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, nextParamIndex, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    const conditions = ['asset_type = $' + nextParamIndex];
    if (whereClause) conditions.unshift(whereClause);
    
    const query = `
      SELECT COALESCE(SUM(purchase_price), 0) AS total_value 
      FROM assets
      ${branchJoin}
      WHERE ${conditions.join(' AND ')}
    `;
    const result = await pool.query(query, [...values, assetType]);
    return result.rows[0].total_value;
  }

  /**
   * Get total asset count with optional access filtering
   */
  async getTotalAssetCount(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    const query = `
      SELECT COUNT(*) 
      FROM assets
      ${branchJoin}
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;
    const result = await pool.query(query, values);
    return result.rows[0].count;
  }

  /**
   * Get total expense sum with optional access filtering
   */
  async getTotalExpenseSum(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    // Expense query already joins to assets, add branch join if needed
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    const query = `
      SELECT COALESCE(SUM(expenses.amount), 0) as sum
      FROM expenses
      INNER JOIN assets ON expenses.asset_id = assets.id
      ${branchJoin}
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;
    const result = await pool.query(query, values);
    return result.rows[0].sum;
  }

  /**
   * Get expense details for all assets with optional access filtering
   */
  async getExpenseDetailForAllAssets(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const query = `
      SELECT
        expenses.id,
        expense_types.name,
        assets.asset_tag,
        assets.manufacturer,
        assets.model,
        assets.serial_number,
        assets.status,
        assets.purchase_date,
        assets.purchase_price,
        assets.notes As assets_notes,
        expenses.asset_id,
        expenses."date" As expense_date,
        expenses.amount As expense_amount,
        expenses.vendor,
        expenses.invoice_number,
        expenses.notes As expense_notes,
        (assets.purchase_price + expenses.amount) As expense_total,
        Sum(expenses.amount) Over () As expense_subtotal,
        branches.name As branch_name,
        branches.location As branch_location
      FROM expenses 
      INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id 
      INNER JOIN assets ON expenses.asset_id = assets.id 
      INNER JOIN branches ON assets.branch_id = branches.id
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get assets by type with optional access filtering
   */
  async getAssetsByType(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    const query = `
      SELECT 
        asset_types.name AS type_name, 
        COUNT(*) AS count,
        COALESCE(SUM(assets.purchase_price), 0) AS total_value
      FROM assets 
      INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
      ${branchJoin}
      ${whereClause ? 'WHERE ' + whereClause : ''}
      GROUP BY asset_types.name
      ORDER BY count DESC
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get assets by status with optional access filtering
   */
  async getAssetsByStatus(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    const query = `
      SELECT 
        asset_statuses.name AS status_name, 
        COUNT(*) AS count
      FROM assets 
      INNER JOIN asset_statuses ON assets.asset_status_id = asset_statuses.id
      ${branchJoin}
      ${whereClause ? 'WHERE ' + whereClause : ''}
      GROUP BY asset_statuses.name
      ORDER BY count DESC
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get assets by branch with optional access filtering
   * Note: Already has branch join, so company filtering works naturally
   */
  async getAssetsByBranch(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values } = buildAccessFilterConditions(filter, { branchTable: 'assets', requiresBranchJoin: true });
    
    const query = `
      SELECT 
        branches.name AS branch_name, 
        COUNT(*) AS count,
        COALESCE(SUM(assets.purchase_price), 0) AS total_value
      FROM assets 
      INNER JOIN branches ON assets.branch_id = branches.id
      ${whereClause ? 'WHERE ' + whereClause : ''}
      GROUP BY branches.name
      ORDER BY count DESC
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get monthly expenses with optional access filtering
   */
  async getMonthlyExpenses(months: number = 6, AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    let conditions = [`expenses.date >= CURRENT_DATE - INTERVAL '${months} months'`];
    if (whereClause) {
      conditions.push(whereClause);
    }
    
    const query = `
      SELECT 
        TO_CHAR(expenses.date, 'Mon YYYY') AS month,
        COALESCE(SUM(expenses.amount), 0) AS total
      FROM expenses
      INNER JOIN assets ON expenses.asset_id = assets.id
      ${branchJoin}
      WHERE ${conditions.join(' AND ')}
      GROUP BY TO_CHAR(expenses.date, 'Mon YYYY'), DATE_TRUNC('month', expenses.date)
      ORDER BY DATE_TRUNC('month', expenses.date) ASC
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get recent assignments with optional access filtering
   */
  async getRecentAssignments(limit: number = 10, AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, nextParamIndex, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    // Use INNER JOIN when company filtering is needed to ensure branches.company_id is available
    const branchJoinType = needsBranchJoin ? 'INNER JOIN' : 'LEFT JOIN';
    
    let conditions = ['assignments.return_date IS NULL'];
    if (whereClause) {
      conditions.push(whereClause);
    }
    
    const query = `
      SELECT 
        assignments.assignment_date,
        CONCAT(employees.first_name, ' ', COALESCE(employees.middle_name, ''), ' ', employees.last_name) AS employee_name,
        assets.asset_tag,
        asset_types.name AS asset_type,
        branches.name AS branch_name
      FROM assignments
      INNER JOIN employees ON assignments.employee_id = employees.id
      INNER JOIN assets ON assignments.asset_id = assets.id
      INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
      ${branchJoinType} branches ON assets.branch_id = branches.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY assignments.assignment_date DESC
      LIMIT $${nextParamIndex}
    `;
    const result = await pool.query(query, [...values, limit]);
    return result.rows;
  }

  /**
   * Get top expensive assets with optional access filtering
   */
  async getTopExpensiveAssets(limit: number = 5, AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, nextParamIndex, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    // Use INNER JOIN when company filtering is needed
    const branchJoinType = needsBranchJoin ? 'INNER JOIN' : 'LEFT JOIN';
    
    const query = `
      SELECT 
        assets.asset_tag,
        asset_types.name AS asset_type,
        assets.manufacturer,
        assets.model,
        assets.purchase_price,
        COALESCE(SUM(expenses.amount), 0) AS total_expenses,
        (assets.purchase_price + COALESCE(SUM(expenses.amount), 0)) AS total_cost,
        branches.name AS branch_name
      FROM assets
      INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
      LEFT JOIN expenses ON assets.id = expenses.asset_id
      ${branchJoinType} branches ON assets.branch_id = branches.id
      ${whereClause ? 'WHERE ' + whereClause : ''}
      GROUP BY assets.id, assets.asset_tag, asset_types.name, assets.manufacturer, 
               assets.model, assets.purchase_price, branches.name
      ORDER BY total_cost DESC
      LIMIT $${nextParamIndex}
    `;
    const result = await pool.query(query, [...values, limit]);
    return result.rows;
  }

  /**
   * Get assignment statistics with optional access filtering
   */
  async getAssignmentStats(AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    const branchJoin = needsBranchJoin ? 'INNER JOIN branches ON assets.branch_id = branches.id' : '';
    
    const query = `
      SELECT 
        COUNT(CASE WHEN assignments.return_date IS NULL THEN 1 END) AS active_assignments,
        COUNT(CASE WHEN assignments.return_date IS NOT NULL THEN 1 END) AS returned_assignments,
        COUNT(*) AS total_assignments
      FROM assignments
      INNER JOIN assets ON assignments.asset_id = assets.id
      ${branchJoin}
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get recent expenses with optional access filtering
   */
  async getRecentExpenses(limit: number = 10, AccessFilterContext?: AccessFilterContext) {
    const filter = createAccessFilter(AccessFilterContext);
    const { whereClause, values, nextParamIndex, needsBranchJoin } = buildAccessFilterConditions(filter, { branchTable: 'assets' });
    
    // Use INNER JOIN when company filtering is needed
    const branchJoinType = needsBranchJoin ? 'INNER JOIN' : 'LEFT JOIN';
    
    const query = `
      SELECT 
        expenses.date AS expense_date,
        expenses.amount,
        expense_types.name AS expense_type,
        assets.asset_tag,
        expenses.vendor,
        branches.name AS branch_name
      FROM expenses
      INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id
      INNER JOIN assets ON expenses.asset_id = assets.id
      ${branchJoinType} branches ON assets.branch_id = branches.id
      ${whereClause ? 'WHERE ' + whereClause : ''}
      ORDER BY expenses.date DESC
      LIMIT $${nextParamIndex}
    `;
    const result = await pool.query(query, [...values, limit]);
    return result.rows;
  }
}

export default new ReportModel();
