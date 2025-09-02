#!/usr/bin/env node

// Test script to validate PostgreSQL setup locally before Railway deployment
const { createDb } = require('./backend/db/dbAdapter');
require('dotenv').config();

async function testPostgreSQLSetup() {
    console.log('🧪 Testing PostgreSQL Setup Locally');
    console.log('=====================================\n');

    // Check environment variables
    console.log('📋 Environment Check:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'configured' : 'not configured'}`);
    console.log('');

    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL not configured. Please set up a local PostgreSQL database.');
        console.log('Example: DATABASE_URL=postgresql://username:password@localhost:5432/adonai_test');
        process.exit(1);
    }

    try {
        // Test database connection
        console.log('🔌 Testing Database Connection...');
        const db = createDb();
        
        const testResult = await db.prepare('SELECT 1 as test').get();
        if (testResult && testResult.test === 1) {
            console.log('✅ Database connection successful');
        } else {
            throw new Error('Unexpected test result');
        }

        // Test SQL conversion
        console.log('\n🔄 Testing SQL Parameter Conversion...');
        const testSql = 'SELECT * FROM users WHERE username = ? AND id = ?';
        const convertedSql = testSql.replace(/\?/g, (() => {
            let index = 0;
            return () => {
                index += 1;
                return `$${index}`;
            };
        })());
        
        console.log(`Original SQL: ${testSql}`);
        console.log(`Converted SQL: ${convertedSql}`);
        
        if (convertedSql === 'SELECT * FROM users WHERE username = $1 AND id = $2') {
            console.log('✅ SQL parameter conversion working correctly');
        } else {
            throw new Error('SQL parameter conversion failed');
        }

        // Test table creation (simulate migration)
        console.log('\n🏗️  Testing Table Creation...');
        
        // Drop test table if exists
        try {
            await db.prepare('DROP TABLE IF EXISTS test_table').run();
        } catch (e) {
            // Ignore errors
        }

        // Create test table
        await db.prepare(`
            CREATE TABLE test_table (
                id SERIAL PRIMARY KEY,
                name TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `).run();
        console.log('✅ Test table created successfully');

        // Test insert with parameters
        console.log('\n📝 Testing Insert with Parameters...');
        const insertResult = await db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING *')
            .run('test_user_' + Date.now(), 'test_hash');
        
        if (insertResult.rows && insertResult.rows.length > 0) {
            console.log('✅ Insert with parameters successful');
            console.log(`Inserted user ID: ${insertResult.rows[0].id}`);
        } else {
            throw new Error('Insert operation failed');
        }

        // Test select with parameters
        console.log('\n🔍 Testing Select with Parameters...');
        const selectResult = await db.prepare('SELECT * FROM users WHERE username LIKE ?')
            .all('test_user_%');
        
        if (selectResult && selectResult.length > 0) {
            console.log('✅ Select with parameters successful');
            console.log(`Found ${selectResult.length} test users`);
        }

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await db.prepare('DELETE FROM users WHERE username LIKE ?').run('test_user_%');
        await db.prepare('DROP TABLE IF EXISTS test_table').run();
        console.log('✅ Cleanup completed');

        console.log('\n🎉 All PostgreSQL tests passed! Ready for Railway deployment.');
        
    } catch (error) {
        console.error('\n❌ PostgreSQL test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the test
testPostgreSQLSetup().catch(console.error);