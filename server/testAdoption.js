const pool = require('./db');

async function testAdoptionSystem() {
    try {
        console.log('🔍 Testing Adoption System Setup...\n');

        // 1. Check if tables exist
        console.log('1. Checking if tables exist...');
        const [tables] = await pool.query("SHOW TABLES LIKE 'adoption%'");
        console.log('   Found tables:', tables.map(t => Object.values(t)[0]));
        
        if (tables.length === 0) {
            console.log('   ❌ ERROR: Adoption tables do not exist!');
            console.log('   Run: mysql -u root -p aurelia < createAdoptionTables.sql');
            await pool.end();
            return;
        }

        // 2. Check table structure
        console.log('\n2. Checking adoption_applications structure...');
        const [columns] = await pool.query("DESCRIBE adoption_applications");
        console.log(`   ✓ Table has ${columns.length} columns`);

        // 3. Check for any existing applications
        console.log('\n3. Checking for existing applications...');
        const [apps] = await pool.query('SELECT COUNT(*) as count FROM adoption_applications');
        console.log(`   Found ${apps[0].count} application(s)`);

        // 4. Check users table
        console.log('\n4. Checking users...');
        const [users] = await pool.query('SELECT id, role, name, email FROM users');
        console.log(`   Found ${users.length} user(s):`);
        users.forEach(u => {
            console.log(`   - ${u.name} (${u.role}) - ID: ${u.id}`);
        });

        // 5. Check pets table
        console.log('\n5. Checking pets...');
        const [pets] = await pool.query('SELECT id, name, breed FROM pets');
        console.log(`   Found ${pets.length} pet(s):`);
        pets.forEach(p => {
            console.log(`   - ${p.name} (${p.breed}) - ID: ${p.id}`);
        });

        console.log('\n✅ All checks passed! Database is ready.');
        console.log('\n💡 Tips:');
        console.log('   - Make sure backend server is running (npm start)');
        console.log('   - Check browser console for errors');
        console.log('   - Check backend terminal for API request logs');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n💡 Tables do not exist. Run:');
            console.log('   mysql -u root -p aurelia < createAdoptionTables.sql');
        }
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testAdoptionSystem();
