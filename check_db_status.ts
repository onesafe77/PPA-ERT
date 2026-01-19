
import { db } from './server/db';
import { aparInspections } from './server/schema';
import { sql } from 'drizzle-orm';

async function checkConnection() {
    console.log('--- Checking Database Connection ---');
    try {
        // 1. Check basic connection
        const result = await db.execute(sql`SELECT 1`);
        console.log('✅ Database connection successful');

        // 2. Check if table exists
        console.log('--- Checking apar_inspections table ---');
        try {
            await db.select().from(aparInspections).limit(1);
            console.log('✅ Table apar_inspections exists and is readable');
        } catch (err) {
            console.log('❌ Error accessing apar_inspections table:', err.message);
            // Try to describe to see if it exists at all
            try {
                await db.execute(sql`DESCRIBE apar_inspections`);
                console.log('ℹ️ Table exists but select failed (schema mismatch?)');
            } catch (descErr) {
                console.log('❌ Table likely does not exist:', descErr.message);
            }
        }

    } catch (error) {
        console.error('❌ Fatal Database Error:', error);
    }
    process.exit(0);
}

checkConnection();
