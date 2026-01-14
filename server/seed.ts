import { db } from './db';
import { users } from './schema';

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        await db.insert(users).values({
            employeeId: '23001138',
            name: 'Saralim',
            role: 'user',
            password: '12345678',
        });
        console.log('✅ User seeded: Saralim (23001138)');
    } catch (error: any) {
        if (error.code === '23505') {
            console.log('⚠️ User already exists.');
        } else {
            console.error('Error seeding:', error);
        }
    } finally {
        process.exit(0);
    }
}

seed();
