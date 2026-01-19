import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function testConnection() {
    console.log('🔍 Testing MySQL Connection...\n');

    try {
        // Test basic query
        const result = await db.execute(sql`SELECT 1 as test`);
        console.log('✅ Database connection successful!');
        console.log('Result:', result);

        // Check if apar_inspections table exists
        console.log('\n🔍 Checking apar_inspections table...');
        const tables = await db.execute(sql`SHOW TABLES LIKE 'apar_inspections'`);

        if (tables && tables.length > 0) {
            console.log('✅ Table apar_inspections exists');

            // Try to count rows
            const count = await db.execute(sql`SELECT COUNT(*) as total FROM apar_inspections`);
            console.log('📊 Total APAR records:', count);
        } else {
            console.log('❌ Table apar_inspections NOT FOUND');
            console.log('⚠️  Please run database_schema.sql in phpMyAdmin');
        }

    } catch (error: any) {
        console.error('❌ Database Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('1. Check if XAMPP MySQL is running');
        console.error('2. Verify DATABASE_URL in .env file');
        console.error('3. Ensure database "ppa" exists in phpMyAdmin');
    }

    process.exit(0);
}

testConnection();
