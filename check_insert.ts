
import { db } from './server/db';
import { aparInspections } from './server/schema';
import { sql } from 'drizzle-orm';

async function testInsert() {
    console.log('--- Testing APAR Insert ---');
    try {
        const result = await db.insert(aparInspections).values({
            date: new Date(),
            location: 'TEST_LOC',
            unitNumber: 'TEST_UNIT',
            capacity: '6 Kg',
            tagNumber: 'TEST_TAG',
            checklistData: '{}',
            condition: 'LAYAK', // This maps to condition_status in schema.ts
            notes: 'Test note',
            pic: 'Tester',
            userId: null
        });

        // Mysql result usually has insertId
        console.log('Insert Result:', result);
        console.log('✅ Insert successful');

    } catch (error) {
        console.error('❌ Insert Failed:', error);
    }
    process.exit(0);
}

testInsert();
