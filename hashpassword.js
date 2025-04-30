
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const addUser = async () => {
    const email = 'irungu.en@gmail.com';
    const username = 'eirungu';
    const name = 'Edwin Irungu';
    const bio = 'Hello there! Nice to meet you.';
    const profilePic = 'https://randomuser.me/api/portraits/men/1.jpg';
    const plainPassword = 'irungu99';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const verified = true;
    const accountStatus = 'active';
    const latitude = -1.2956;
    const longitude = 36.8219;

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

