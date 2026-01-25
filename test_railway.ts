import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing Railway Connection...');
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connected to Railway! Time:', res.rows[0].now);

        console.log('Checking for tables...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        if (tables.rows.length === 0) {
            console.log('❌ No tables found in public schema!');
        } else {
            console.log('✅ Found tables:');
            tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
        }

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed:', err);
        process.exit(1);
    }
}
test();
