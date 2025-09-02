import pool from '../config/database';

class ReportModel {
  async getTotalAssetValue() {
    const query = 'SELECT SUM(purchase_price) AS total_value FROM assets';
    const result = await pool.query(query);
    return result.rows[0].total_value;
  }

  async getTotalValueByCategory(assetType: string) {
    const query = 'SELECT SUM(purchase_price) AS total_value FROM assets WHERE asset_type = $1';
    const result = await pool.query(query, [assetType]);
    return result.rows[0].total_value;
  }
}

export default new ReportModel();