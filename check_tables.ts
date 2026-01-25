
import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function listTables() {
    console.log('--- Checking Tables ---');
    try {
        // Query to list all tables in the public schema
        const res = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log('Tables found:', res.rows.map((r: any) => r.table_name));

        if (res.rows.length === 0) {
            console.log('⚠️ NO TABLES FOUND! The database is empty.');
            console.log('Did you run the Restore command successfully?');
        }
    } catch (e: any) {
        console.error('Error querying tables:', e.message);
    }
    process.exit(0);
}

listTables();
