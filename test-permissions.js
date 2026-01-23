const pool = require('./dist/config/database').default;
const BranchModel = require('./dist/models/branch.model').default;

async function test() {
    try {
        // Check both ASSETS and ASSETS_VIEW permissions
        console.log('=== Checking ASSETS permissions ===');
        const assetsResult = await pool.query(`
            SELECT rp.branch_level_access, m.code as module_code, p.action
            FROM role_permissions rp 
            JOIN permissions p ON rp.permission_id = p.id 
            JOIN modules m ON p.module_id = m.id 
            WHERE rp.role_id = 3 AND m.code = 'ASSETS'
        `);
        console.log('ASSETS permissions for Branch User:');
        console.log(assetsResult.rows);
        
        console.log('\n=== Checking ASSETS_VIEW permissions ===');
        const assetsViewResult = await pool.query(`
            SELECT rp.branch_level_access, m.code as module_code, p.action
            FROM role_permissions rp 
            JOIN permissions p ON rp.permission_id = p.id 
            JOIN modules m ON p.module_id = m.id 
            WHERE rp.role_id = 3 AND m.code = 'ASSETS_VIEW'
        `);
        console.log('ASSETS_VIEW permissions for Branch User:');
        console.log(assetsViewResult.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
