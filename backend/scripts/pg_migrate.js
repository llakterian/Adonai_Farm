// Create tables in Postgres matching the SQLite schema, with a few additions for photos
// Only load .env file if not in Railway environment
if (!process.env.RAILWAY_ENVIRONMENT) {
    require('dotenv').config();
    console.log('[migrate] Loaded local .env file');
} else {
    console.log('[migrate] Running in Railway environment, using Railway variables');
}

const { createDb } = require('../db/dbAdapter');

// Migration steps configuration - database agnostic
function getMigrationSteps(isPostgres) {
    const timestampType = isPostgres ? 'TIMESTAMPTZ' : 'TEXT';
    const primaryKeyType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const nowDefault = isPostgres ? 'DEFAULT NOW()' : "DEFAULT (datetime('now'))";
    
    return [
        {
            name: 'users',
            description: 'Creating users table',
            sql: `
                CREATE TABLE IF NOT EXISTS users (
                    id ${primaryKeyType},
                    username TEXT UNIQUE,
                    password_hash TEXT
                );
            `
        },
        {
            name: 'animals',
            description: 'Creating animals table',
            sql: `
                CREATE TABLE IF NOT EXISTS animals (
                    id ${primaryKeyType},
                    type TEXT,
                    name TEXT,
                    dob TEXT,
                    sex TEXT,
                    notes TEXT
                );
            `
        },
        {
            name: 'photos',
            description: 'Creating photos table',
            sql: `
                CREATE TABLE IF NOT EXISTS photos (
                    id ${primaryKeyType},
                    filename TEXT,
                    path TEXT,
                    uploaded_at ${timestampType} ${nowDefault},
                    public_id TEXT,
                    secure_url TEXT
                );
            `
        },
        {
            name: 'workers',
            description: 'Creating workers table',
            sql: `
                CREATE TABLE IF NOT EXISTS workers (
                    id ${primaryKeyType},
                    name TEXT NOT NULL,
                    employee_id TEXT UNIQUE,
                    role TEXT,
                    hourly_rate REAL DEFAULT 0,
                    phone TEXT,
                    created_at ${timestampType} ${nowDefault}
                );
            `
        },
        {
            name: 'time_entries',
            description: 'Creating time_entries table',
            sql: `
                CREATE TABLE IF NOT EXISTS time_entries (
                    id ${primaryKeyType},
                    worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
                    clock_in ${timestampType},
                    clock_out ${timestampType},
                    hours_worked REAL,
                    date TEXT,
                    notes TEXT,
                    created_at ${timestampType} ${nowDefault}
                );
            `
        }
    ];
}

async function logStep(step, status = 'info', error = null) {
    const timestamp = new Date().toISOString();
    const statusSymbol = {
        'info': 'ℹ',
        'success': '✓',
        'error': '✗',
        'warning': '⚠'
    }[status] || 'ℹ';
    
    console.log(`[${timestamp}] ${statusSymbol} ${step}`);
    
    if (error) {
        console.error(`[${timestamp}] Error details:`, {
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            stack: error.stack
        });
    }
}

async function validateDatabaseConnection(db) {
    try {
        logStep('Validating database connection...');
        
        // Test basic connectivity with a simple query
        await db.prepare('SELECT 1 as test').get();
        
        logStep('Database connection validated successfully', 'success');
        return true;
    } catch (error) {
        logStep('Database connection validation failed', 'error', error);
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

async function createTable(db, step) {
    try {
        logStep(`${step.description}...`);
        
        const result = await db.prepare(step.sql).run();
        
        logStep(`${step.name} table created successfully (affected rows: ${result.rowCount || 0})`, 'success');
        return true;
    } catch (error) {
        logStep(`Failed to create ${step.name} table`, 'error', error);
        logStep(`SQL that failed: ${step.sql.trim().replace(/\s+/g, ' ')}`);
        throw new Error(`Table creation failed for ${step.name}: ${error.message}`);
    }
}

async function createDefaultAdminUser(db) {
    try {
        logStep('Checking for existing admin user...');
        
        const existingUser = await db.prepare('SELECT id FROM users LIMIT 1').get();
        
        if (existingUser) {
            logStep('Admin user already exists, skipping creation', 'warning');
            return false;
        }
        
        logStep('Creating default admin user...');
        
        // Import bcrypt with error handling
        let bcrypt;
        try {
            bcrypt = require('bcrypt');
        } catch (error) {
            throw new Error(`bcrypt dependency not found: ${error.message}`);
        }
        
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        
        if (!defaultPassword || defaultPassword.length < 6) {
            throw new Error('Default admin password must be at least 6 characters long');
        }
        
        logStep(`Hashing password for admin user...`);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        logStep('Inserting admin user into database...');
        const result = await db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hashedPassword);
        
        logStep(`Default admin user created successfully (username: admin, affected rows: ${result.rowCount || 0})`, 'success');
        
        if (process.env.DEFAULT_ADMIN_PASSWORD) {
            logStep('Using custom admin password from environment variable', 'info');
        } else {
            logStep('Using default admin password: admin123', 'warning');
        }
        
        return true;
    } catch (error) {
        logStep('Failed to create default admin user', 'error', error);
        throw new Error(`Admin user creation failed: ${error.message}`);
    }
}

async function runMigration() {
    let db = null;
    const startTime = Date.now();
    
    try {
        // Detect database type
        const isPostgres = !!process.env.DATABASE_URL;
        const dbType = isPostgres ? 'PostgreSQL' : 'SQLite';
        
        logStep(`=== Starting ${dbType} Migration ===`);
        logStep(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logStep(`Database URL configured: ${isPostgres}`);
        logStep(`Database type: ${dbType}`);
        
        // Initialize database connection
        logStep('Initializing database connection...');
        db = createDb();
        
        if (!db) {
            throw new Error('Failed to initialize database adapter');
        }
        
        // Validate database connection
        await validateDatabaseConnection(db);
        
        // Get migration steps for the detected database type
        const migrationSteps = getMigrationSteps(isPostgres);
        
        // Execute migration steps
        logStep(`Executing ${migrationSteps.length} migration steps...`);
        
        for (let i = 0; i < migrationSteps.length; i++) {
            const step = migrationSteps[i];
            logStep(`Step ${i + 1}/${migrationSteps.length}: ${step.description}`);
            
            await createTable(db, step);
        }
        
        // Create default admin user
        logStep('Setting up default admin user...');
        await createDefaultAdminUser(db);
        
        const duration = Date.now() - startTime;
        logStep(`=== ${dbType} migration completed successfully in ${duration}ms ===`, 'success');
        
        return true;
    } catch (error) {
        const duration = Date.now() - startTime;
        const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
        logStep(`=== ${dbType} migration failed after ${duration}ms ===`, 'error', error);
        
        // Log environment information for debugging
        logStep('Environment debugging information:', 'info');
        console.log({
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL_SET: !!process.env.DATABASE_URL,
            DEFAULT_ADMIN_PASSWORD_SET: !!process.env.DEFAULT_ADMIN_PASSWORD,
            WORKING_DIRECTORY: process.cwd(),
            DATABASE_TYPE: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'
        });
        
        throw error;
    }
}

// Main execution
(async () => {
    try {
        await runMigration();
        logStep('Migration process completed successfully. Exiting with code 0.', 'success');
        process.exit(0);
    } catch (error) {
        logStep('Migration process failed. Exiting with code 1.', 'error', error);
        process.exit(1);
    }
})();