import mysql from 'mysql2/promise';

async function testConnection() {
    console.log('🔍 Testing MySQL Connection...\n');

    try {
        // Test connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: ''
        });

        console.log('✅ MySQL Connection: SUCCESS');

        // Check if database exists
        const [databases] = await connection.query('SHOW DATABASES');
        console.log('\n📋 Available Databases:');
        databases.forEach((db: any) => {
            console.log(`   - ${db.Database}`);
        });

        // Check if 'ppa' database exists
        const hasPPA = databases.some((db: any) => db.Database === 'ppa');

        if (hasPPA) {
            console.log('\n✅ Database "ppa" EXISTS');

            // Connect to ppa database
            await connection.query('USE ppa');

            // Show tables
            const [tables] = await connection.query('SHOW TABLES');
            console.log('\n📊 Tables in "ppa" database:');
            if (tables.length === 0) {
                console.log('   ⚠️  No tables found! Run database_schema.sql');
            } else {
                tables.forEach((table: any) => {
                    console.log(`   - ${Object.values(table)[0]}`);
                });
            }
        } else {
            console.log('\n❌ Database "ppa" NOT FOUND!');
            console.log('\n📝 To create it, run in phpMyAdmin or MySQL:');
            console.log('   CREATE DATABASE ppa;');
        }

        await connection.end();

    } catch (error: any) {
        console.error('\n❌ MySQL Connection FAILED!');
        console.error('Error:', error.message);
        console.error('\n🔧 Possible solutions:');
        console.error('   1. Make sure XAMPP MySQL is running');
        console.error('   2. Check if port 3306 is correct');
        console.error('   3. Verify username/password (default: root with no password)');
    }
}

testConnection();
