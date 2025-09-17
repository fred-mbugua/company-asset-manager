import pool from '../config/database';

class ExpenseModel {
  async create(expenseData: any) {
    const query = 'INSERT INTO expenses (asset_id, expense_type, date, amount, vendor, invoice_number, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const result = await pool.query(query, [
      expenseData.asset_id,
      expenseData.expense_type,
      expenseData.date,
      expenseData.amount,
      expenseData.vendor,
      expenseData.invoice_number,
      expenseData.notes,
    ]);
    return result.rows[0];
  }

  async findByAssetId(assetId: number) {
    const query = 'SELECT * FROM expenses WHERE asset_id = $1 ORDER BY date DESC';
    const result = await pool.query(query, [assetId]);
    return result.rows;
  }

  async findByTimePeriod(startDate: string, endDate: string) {
    const query = 'SELECT * FROM expenses WHERE date BETWEEN $1 AND $2 ORDER BY date ASC';
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  async findallAssets() {
        const query = 'SELECT * FROM expenses ORDER BY date DESC';
        const result = await pool.query(query);
        return result.rows;
    }

  async update(id: number, updateData: any) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in updateData) {
      fields.push(`${key} = $${index}`);
      values.push(updateData[key]);
      index++;
    }
    const query = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  async delete(id: number) {
    const query = 'DELETE FROM expenses WHERE id = $1';
    await pool.query(query, [id]);
    return { message: 'Expense deleted successfully.' };
  }
}

export default new ExpenseModel();