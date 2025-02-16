require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(cors());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Get the token from the header

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Store decoded user info in the request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

app.get('/api/validate-token', verifyToken, (req, res) => {
    res.json({ isValid: true, user: req.user });
});

// Login Route
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '4h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Listings Route (with Authorization)
app.get('/api/listings', verifyToken, async (req, res) => {
    try {
        const listingsQuery = `
           SELECT 
                l.listing_id, 
                u.user_id, 
                u.name, 
                u.username, 
                u.profile_pic, 
                l.caption, 
                i.title, 
                i.description, 
                i.condition, 
                i.image, 
                COUNT(c.comment) AS comment_count, 
                COUNT(DISTINCT ll.user_id) AS like_count,
                COUNT(o.offer_id) AS offer_count,
                ARRAY_AGG(DISTINCT t.tagname) AS tag_names,
                ic.title AS exchange_category
            FROM listings l 
            JOIN users u ON l.user_id = u.user_id 
            JOIN listing_items li ON l.listing_id = li.listing_id 
            JOIN items i ON li.item_id = i.item_id 
            LEFT JOIN listing_comment c ON c.listing_id = l.listing_id 
            LEFT JOIN listing_like ll ON ll.listing_id = l.listing_id 
            LEFT JOIN offer o ON o.listing_id = l.listing_id
            LEFT JOIN item_tag_association ita ON ita.item_id = i.item_id  
            LEFT JOIN item_tags t ON ita.tag_id = t.tag_id
            LEFT JOIN listing_exchange_categories lec ON lec.item_id = l.listing_id
            LEFT JOIN item_categories ic ON lec.category_id = ic.category_id
            GROUP BY l.listing_id, u.user_id, i.item_id, i.title, i.description, i.condition, i.image, l.caption, ic.title;
        `;

        const result = await pool.query(listingsQuery);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No listings found' });
        }

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.get('/api/items', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from decoded JWT

        const itemsQuery = `
            SELECT 
                i.item_id, 
                i.title, 
                i.description, 
                i.condition, 
                i.image, 
                ARRAY_AGG(DISTINCT t.tagname) AS tag_names
            FROM items i
            LEFT JOIN item_tag_association ita ON ita.item_id = i.item_id
            LEFT JOIN item_tags t ON ita.tag_id = t.tag_id
            WHERE i.user_id = $1
            GROUP BY i.item_id, i.title, i.description, i.condition, i.image;
        `;

        const result = await pool.query(itemsQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No items found' });
        }

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

