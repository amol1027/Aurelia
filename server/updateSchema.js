const pool = require('./db');
const fs = require('fs');

async function updateSchema() {
    try {
        const sql = fs.readFileSync('schema.sql', 'utf8');
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const stmt of statements) {
            if (stmt.trim()) {
                try {
                    await pool.query(stmt);
                } catch (err) {
                    console.log('Statement:', stmt.substring(0, 50) + '...');
                    console.error('Error:', err.message);
                }
            }
        }

        // Keep backward compatibility for existing DBs where pets table already exists.
        try {
            await pool.query('ALTER TABLE pets ADD COLUMN owner_user_id INT NULL');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') {
                throw err;
            }
        }
        
        console.log('✅ Schema updated successfully');
        console.log('New tables: adoption_applications, application_status_history, support_threads, support_messages, direct_threads, direct_messages');
        console.log('Schema updates: pets.owner_user_id support for chat-with-owner feature');
    } catch (err) {
        console.error('Failed to update schema:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

updateSchema();
