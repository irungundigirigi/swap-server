require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { request } = require('http');

const router = express.Router();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        ;
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

app.get('/api/validate-token', verifyToken, (req, res) => {
    res.json({ isValid: true, user: req.user });
});

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
app.post('/api/listing',verifyToken, async (req, res) => {
    const {listing_id,caption, category, item_id} = req.body;
    const user_id = req.user.id;

    const addListingQuery = `INSERT INTO listings (listing_id, user_id, caption) VALUES($1, $2, $3);`
    const listingItemQuery = `INSERT INTO listing_items (listing_id, item_id) VALUES($1, $2);`
    const swapCategoryQuery = `INSERT INTO listing_exchange_categories (item_id, category_id) VALUES($1, $2);`

    try {
        const client = await pool.connect();
        await client.query('BEGIN');
        await client.query(addListingQuery,[listing_id, user_id, caption]);
        await client.query(listingItemQuery,[listing_id, item_id])
        await client.query(swapCategoryQuery,[listing_id, category])
        await client.query('COMMIT');

        res.status(201).json({ message: 'Listing created successfully', listing_id });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });    
    }

});

// Multiple image upload endpoint
app.post('/api/upload',verifyToken, upload.array('images[]', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    console.log(imagePaths);
    res.status(201).json({ imageUrls: imagePaths });
});

app.post('/api/item-upload', verifyToken, upload.array('images[]', 5), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`); // Correct array format
    const { item_id, title, category_id, description, condition, tags } = req.body;
    const user_id = req.user.id;
    const category = Number(category_id);

    let tagsArray = [];
    if (tags) {
        try {
            tagsArray = JSON.parse(tags); // Convert JSON string to array
        } catch (error) {
            return res.status(400).json({ message: 'Invalid tags format' });
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert item into the database with a properly formatted array
        await client.query(
            `INSERT INTO items (item_id, user_id, category_id, title, description, condition, image) 
             VALUES ($1, $2, $3, $4, $5, $6, $7::text[])`,
            [item_id, user_id, category, title, description, condition, imagePaths]
        );

        // Insert tags if provided
        if (tagsArray.length) {
            for (const tag of tagsArray) {
                await client.query(
                    `INSERT INTO item_tag_association (item_id, tag_id) VALUES ($1, $2)`,
                    [item_id, tag]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Item added successfully', item_id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to add item' });
    } finally {
        client.release();
    }
});



app.post('/api/item',verifyToken, async (req, res) => {
    try {
                    // item_id,title,description,condition,image,location,category_id 

        const { item_id, title,category_id, description,image, condition, tags } = req.body;

        const user_id = req.user.id;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Insert item into the database
            await client.query(
                `INSERT INTO items (item_id, user_id,category_id, title, description, condition, image) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [item_id, user_id,category_id, title, description, condition, image]
            );
            
            // Insert tags if provided
            if (tags && tags.length) {
                for (const tag of tags) {
                    await client.query(
                        `INSERT INTO item_tag_association (item_id, tag_id) VALUES ($1, $2)`,
                        [item_id, tag]
                    );
                }
            }
            
            await client.query('COMMIT');
            res.status(201).json({ message: 'Item added successfully', item_id });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ error: 'Failed to add item' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
app.delete('/api/items', verifyToken, async(req, res) => {
    const {item_id} = req.body;
    
    images_Query = `SELECT * FROM items WHERE item_id = $1;`
    delete_item_Query = `DELETE FROM items WHERE item_id = $1;`
    const client = await pool.connect();
    try {
        const res = await client.query(images_Query, [item_id]);
        res.rows[0]?.image.forEach((filename) => {
            const img_url = path.join(__dirname, filename)
            fs.unlink(img_url,(err) => {
                if(err) {
                    console.log(`image ${img_url} was not deleted`);
                } else {
                    console.log( `Deleted image ${img_url}.`)
                }
            })
        })
        await client.query(delete_item_Query, [item_id]);
        res.status(200).json({ message: 'Item deleted successfully!' });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
        
    }
})


// Listings Route (with Authorization) mountain hiking backpack 4ol - comfortable rucksack ventilated taut mesh back for regular mountain hiking
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

