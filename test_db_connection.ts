import { db } from './server/db';
import { sql } from 'drizzle-orm';
import { aparInspections } from './server/schema';

async function testConnection() {
    console.log('🔍 Testing PostgreSQL Connection...\n');

    try {
        // Test basic query
        const result = await db.execute(sql`SELECT 1 as test`);
        console.log('✅ Database connection successful!');

        // Check if apar_inspections table exists
        console.log('\n🔍 Checking apar_inspections table...');

        // In Postgres, we query information_schema or just try to select
        try {
            const countResult = await db.execute(sql`SELECT COUNT(*) as total FROM apar_inspections`);
            console.log('✅ Table apar_inspections exists');
            console.log('📊 Total APAR records:', countResult.rows[0].total);
        } catch (err: any) {
            console.log('❌ Table apar_inspections query failed:', err.message);
            console.log('⚠️  Make sure you imported the SQL file correctly.');
        }

    } catch (error: any) {
        console.error('❌ Database Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('1. Check if PostgreSQL server is running');
        console.error('2. Verify DATABASE_URL in .env file (password correct?)');
        console.error('3. Ensure database "ppa_ert" exists');
    }

    process.exit(0);
}

testConnection();
