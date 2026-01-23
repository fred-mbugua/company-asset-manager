import pool from './src/config/database';

async function runMigration() {
  try {
    // Step 1: Add company_id column to branches table
    console.log('Step 1: Adding company_id column...');
    try {
      await pool.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)`);
      console.log('  Column added or already exists');
    } catch (err: any) {
      console.log('  Error:', err.message);
    }

    // Step 2: Add index for performance
    console.log('Step 2: Adding index...');
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_branches_company_id ON branches(company_id)`);
      console.log('  Index created or already exists');
    } catch (err: any) {
      console.log('  Error:', err.message);
    }

    // Step 3: Update branches with default company (Jirani Smart = 5)
    console.log('Step 3: Updating branches with default company...');
    try {
      const result = await pool.query(`UPDATE branches SET company_id = 5 WHERE company_id IS NULL`);
      console.log('  Updated rows:', result.rowCount);
    } catch (err: any) {
      console.log('  Error:', err.message);
    }

    // Step 4: Verify branches have company_id
    console.log('\n=== BRANCHES WITH COMPANY ===');
    const branches = await pool.query(`
      SELECT b.id, b.name, b.company_id, c.name as company_name
      FROM branches b
      LEFT JOIN companies c ON b.company_id = c.id
      ORDER BY b.id
    `);
    console.log(branches.rows);

    // Step 5: Check sample assets with company info
    console.log('\n=== SAMPLE ASSETS WITH COMPANY INFO ===');
    const assets = await pool.query(`
      SELECT a.id, a.asset_tag, a.branch_id, b.name as branch_name, b.company_id, c.name as company_name
      FROM assets a
      LEFT JOIN branches b ON a.branch_id = b.id
      LEFT JOIN companies c ON b.company_id = c.id
      LIMIT 5
    `);
    console.log(assets.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
