const mysql = require('mysql2/promise');
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    console.log('📋 Table created');

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

    const insertSQL = 'INSERT INTO pets (name, breed, age, personality, image, description) VALUES (?, ?, ?, ?, ?, ?)';

    for (const pet of pets) {
        await connection.execute(insertSQL, [
            pet.name,
            pet.breed,
            pet.age,
            pet.personality,
            pet.image,
            pet.description,
        ]);
    }

    console.log(`🐾 Seeded ${pets.length} pets`);
    await connection.end();
    console.log('✅ Done!');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
