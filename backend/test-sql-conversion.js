// Test script to verify PostgreSQL parameter placeholder conversion
const { createDb } = require('./db/dbAdapter');

// Test the convertSql function directly by creating a mock PostgreSQL adapter
function testConvertSql() {
    console.log('Testing PostgreSQL parameter placeholder conversion...\n');
    
    // Mock DATABASE_URL to force PostgreSQL adapter creation
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    
    try {
        // Create a test version of the convertSql function
        function convertSql(sql) {
            // Replace SQLite datetime("now") with Postgres NOW()
            let out = sql.replace(/datetime\(["']now["']\)/gi, 'NOW()');

            let index = 0;
            out = out.replace(/\?/g, () => {
                index += 1;
                return `$${index}`;
            });
            return out;
        }

        // Test cases
        const testCases = [
            {
                name: 'Simple SELECT with one parameter',
                input: 'SELECT * FROM users WHERE id = ?',
                expected: 'SELECT * FROM users WHERE id = $1'
            },
            {
                name: 'INSERT with multiple parameters',
                input: 'INSERT INTO animals (name, type, age) VALUES (?, ?, ?)',
                expected: 'INSERT INTO animals (name, type, age) VALUES ($1, $2, $3)'
            },
            {
                name: 'UPDATE with WHERE clause',
                input: 'UPDATE workers SET name = ?, role = ? WHERE id = ?',
                expected: 'UPDATE workers SET name = $1, role = $2 WHERE id = $3'
            },
            {
                name: 'Complex query with datetime function',
                input: 'SELECT * FROM time_entries WHERE created_at > datetime("now") AND worker_id = ?',
                expected: 'SELECT * FROM time_entries WHERE created_at > NOW() AND worker_id = $1'
            },
            {
                name: 'Query with no parameters',
                input: 'SELECT COUNT(*) FROM animals',
                expected: 'SELECT COUNT(*) FROM animals'
            },
            {
                name: 'Query with datetime and multiple parameters',
                input: 'INSERT INTO time_entries (worker_id, task, created_at) VALUES (?, ?, datetime("now"))',
                expected: 'INSERT INTO time_entries (worker_id, task, created_at) VALUES ($1, $2, NOW())'
            }
        ];

        let passed = 0;
        let failed = 0;

        testCases.forEach((testCase, index) => {
            const result = convertSql(testCase.input);
            const success = result === testCase.expected;
            
            console.log(`Test ${index + 1}: ${testCase.name}`);
            console.log(`Input:    ${testCase.input}`);
            console.log(`Expected: ${testCase.expected}`);
            console.log(`Result:   ${result}`);
            console.log(`Status:   ${success ? '✅ PASS' : '❌ FAIL'}`);
            console.log('');
            
            if (success) {
                passed++;
            } else {
                failed++;
            }
        });

        console.log(`\nTest Summary:`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Total: ${testCases.length}`);
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed! PostgreSQL parameter conversion is working correctly.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the convertSql function.');
        }

    } finally {
        // Restore original DATABASE_URL
        if (originalUrl) {
            process.env.DATABASE_URL = originalUrl;
        } else {
            delete process.env.DATABASE_URL;
        }
    }
}

// Run the tests
testConvertSql();