// Check user password hash and test login
require('dotenv').config();
const { createDb } = require('../db/dbAdapter');
const bcrypt = require('bcrypt');

(async () => {
    try {
        const db = createDb();

        // Get user data
        const user = await db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
        console.log('User data:', {
            id: user.id,
            username: user.username,
            password_hash: user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'NULL/UNDEFINED'
        });

        if (!user.password_hash) {
            console.log('❌ No password hash found for user');
            process.exit(1);
        }

        // Test common passwords
        const testPasswords = ['admin123', 'password', 'admin', '123456', 'adonai123'];

        for (const pwd of testPasswords) {
            const isValid = await bcrypt.compare(pwd, user.password_hash);
            console.log(`Password "${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
            if (isValid) break;
        }

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();