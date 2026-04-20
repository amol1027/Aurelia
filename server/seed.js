const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
    // Connect without specifying a database first to create it
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
    });

    console.log('🔗 Connected to MySQL');

    // Create database and table
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'aurelia'}\``);
    await connection.query(`USE \`${process.env.DB_NAME || 'aurelia'}\``);

    await connection.query(`
    DROP TABLE IF EXISTS application_status_history;
    DROP TABLE IF EXISTS adoption_applications;
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS direct_messages;
    DROP TABLE IF EXISTS direct_threads;
    DROP TABLE IF EXISTS support_messages;
    DROP TABLE IF EXISTS support_threads;
    DROP TABLE IF EXISTS pets;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role ENUM('adopter', 'shelter') NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      shelter_name VARCHAR(200),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE pets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      breed VARCHAR(100) NOT NULL,
      age VARCHAR(50) NOT NULL,
      personality JSON NOT NULL,
      image VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
            owner_user_id INT NULL,
            FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

        CREATE TABLE favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            pet_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
            UNIQUE KEY unique_favorite (user_id, pet_id)
        );

        CREATE TABLE support_threads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_thread (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE support_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            thread_id INT NOT NULL,
            sender_role ENUM('adopter', 'shelter', 'admin') NOT NULL,
            sender_user_id INT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (thread_id) REFERENCES support_threads(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE direct_threads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pet_id INT NOT NULL,
            owner_user_id INT NOT NULL,
            participant_user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_pet_chat (pet_id, owner_user_id, participant_user_id),
            FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
            FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (participant_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE direct_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            thread_id INT NOT NULL,
            sender_user_id INT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (thread_id) REFERENCES direct_threads(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE adoption_applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pet_id INT NOT NULL,
            adopter_id INT NOT NULL,
            status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed', 'withdrawn') DEFAULT 'pending',
            home_type ENUM('house', 'apartment', 'condo', 'other') NOT NULL,
            home_ownership ENUM('own', 'rent') NOT NULL,
            has_yard BOOLEAN DEFAULT FALSE,
            yard_fenced BOOLEAN DEFAULT FALSE,
            has_other_pets BOOLEAN DEFAULT FALSE,
            other_pets_details TEXT,
            has_children BOOLEAN DEFAULT FALSE,
            children_ages VARCHAR(255),
            pet_experience TEXT NOT NULL,
            previous_pets TEXT,
            vet_reference VARCHAR(255),
            vet_phone VARCHAR(20),
            personal_reference_name VARCHAR(100),
            personal_reference_phone VARCHAR(20),
            personal_reference_relationship VARCHAR(100),
            reason_for_adoption TEXT NOT NULL,
            special_accommodations TEXT,
            hours_alone_per_day INT,
            exercise_plan TEXT,
            emergency_contact_name VARCHAR(100),
            emergency_contact_phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
            FOREIGN KEY (adopter_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE application_status_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_id INT NOT NULL,
            old_status VARCHAR(50),
            new_status VARCHAR(50) NOT NULL,
            changed_by INT NOT NULL,
            notes TEXT,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (application_id) REFERENCES adoption_applications(id) ON DELETE CASCADE,
            FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
        );
  `);

    console.log('📋 Table created');

    const seedAdminOwnerEmail = process.env.SEED_ADMIN_OWNER_EMAIL || 'seed-admin-owner@aurelia.local';
    const seedAdminOwnerPassword = process.env.SEED_ADMIN_OWNER_PASSWORD || 'AdminOwner@123';
    const hashedSeedOwnerPassword = await bcrypt.hash(seedAdminOwnerPassword, 10);

    // Seed-only default owner used for predefined pets.
    const [seedOwnerResult] = await connection.execute(
        `INSERT INTO users (role, name, email, password, phone, shelter_name, address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            'shelter',
            'Administrator',
            seedAdminOwnerEmail,
            hashedSeedOwnerPassword,
            null,
            'Aurelia Admin Shelter',
            'System Seed Owner',
        ]
    );

    const seedOwnerId = seedOwnerResult.insertId;

    // Insert sample pets
    const pets = [
        {
            name: 'Luna',
            breed: 'Golden Retriever',
            age: '2 years',
            personality: JSON.stringify(['Playful', 'Loyal', 'Gentle']),
            image: '/pets/luna.webp',
            description: 'A sunshine-loving retriever who greets everyone with a wagging tail and a warm heart.',
        },
        {
            name: 'Mochi',
            breed: 'Ragdoll Cat',
            age: '1 year',
            personality: JSON.stringify(['Calm', 'Affectionate', 'Curious']),
            image: '/pets/mochi.webp',
            description: 'A fluffy cloud of purrs who loves lap time and chasing feather toys.',
        },
        {
            name: 'Bear',
            breed: 'Bernese Mountain Dog',
            age: '3 years',
            personality: JSON.stringify(['Gentle Giant', 'Protective', 'Friendly']),
            image: '/pets/bear.webp',
            description: "A majestic mountain dog who thinks he's a lapdog. Best hiking buddy you'll ever have.",
        },
        {
            name: 'Willow',
            breed: 'Tabby Cat',
            age: '6 months',
            personality: JSON.stringify(['Adventurous', 'Smart', 'Independent']),
            image: '/pets/willow.webp',
            description: 'A tiny explorer with enormous whiskers and an even bigger personality.',
        },
        {
            name: 'Biscuit',
            breed: 'Corgi',
            age: '1.5 years',
            personality: JSON.stringify(['Energetic', 'Silly', 'Loving']),
            image: '/pets/biscuit.webp',
            description: 'Short legs, big dreams. Biscuit will waddle straight into your heart.',
        },
        {
            name: 'Olive',
            breed: 'Siamese Cat',
            age: '2 years',
            personality: JSON.stringify(['Vocal', 'Elegant', 'Loyal']),
            image: '/pets/olive.webp',
            description: 'A regal companion with striking blue eyes and opinions about everything.',
        },
    ];

    const insertSQL = 'INSERT INTO pets (name, breed, age, personality, image, description, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';

    for (const pet of pets) {
        await connection.execute(insertSQL, [
            pet.name,
            pet.breed,
            pet.age,
            pet.personality,
            pet.image,
            pet.description,
            seedOwnerId,
        ]);
    }

    console.log(`🐾 Seeded ${pets.length} pets`);
    console.log(`👤 Seed owner assigned: Administrator (user id ${seedOwnerId})`);
    console.log(`📧 Seed owner email: ${seedAdminOwnerEmail}`);
    await connection.end();
    console.log('✅ Done!');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
