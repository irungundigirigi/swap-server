
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const addUser = async () => {
    const email = 'tevin.ajode@gmail.com'; // Change this
    const username = 'tajode'; // Change this
    const name = 'Tevin Ajode'; // Change this
    const bio = 'Hello there! Nice to meet you.'; // Change this
    const profilePic = 'https://randomuser.me/api/portraits/men/1.jpg'; // Change this
    const plainPassword = 'tajode123'; // Change this
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const verified = true;
    const accountStatus = 'active';
    const latitude = -1.2956; // Example for Nairobi
    const longitude = 36.8219; // Example for Nairobi

    const query = `
        INSERT INTO users (username, email, password, name, bio, profile_pic, verified, account_status, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, POINT($9, $10))
    `;

    try {
        await pool.query(query, [username, email, hashedPassword, name, bio, profilePic, verified, accountStatus, longitude, latitude]);
        console.log('User added with hashed password');
    } catch (err) {
        console.error('Error adding user:', err);
    } finally {
        process.exit();
    }
};

addUser();

