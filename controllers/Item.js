import path from 'path';
import fs from 'fs';
import pool from '../db.js'; 

class ItemController {
  static async getItems(req,res) {
    try {
      const userId = req.user.id; // Extract user ID from decoded JWT

      const itemsQuery = `
          SELECT 
              i.item_id, 
              i.title, 
              i.description, 
              i.condition, 
              i.image, 
              ARRAY_AGG(DISTINCT t.tag_name) AS tag_names
          FROM items i
          LEFT JOIN item_tag_association ita ON ita.item_id = i.item_id
          LEFT JOIN item_tags t ON ita.tag_id = t.id
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

  };

  static async checkTitle(req, res) {
    const { title } = req.query;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Valid title is required' });
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT 1 FROM items WHERE TRIM(title) ILIKE TRIM($1) LIMIT 1',
        [title]
      );
      res.json({ exists: result.rowCount > 0 });
    } catch (error) {
      console.error('Error checking item title:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }

  static async getCategories(req, res) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT category_id, title FROM item_categories;');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    } finally {
      client.release();
    }
  }

  static async getCategoryTags(req, res) {
    const client = await pool.connect();
    const c_id = req.query.category_id;
    try {
      const result = await client.query('SELECT * FROM item_tags WHERE category_id = $1;', [c_id]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    } finally {
      client.release();
    }
  }

  static async addItem(req, res) {
    const { item_id, title, category_id, description, condition, tags, image } = req.body;
    const user_id = req.user.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO items (item_id, user_id, category_id, title, description, condition, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [item_id, user_id, category_id, title, description, condition, image]
      );

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
  }

  static async addItemWithUpload(req, res) {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    const { item_id, title, category_id, description, condition, tags } = req.body;
    const user_id = req.user.id;
    const category = Number(category_id);

    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = JSON.parse(tags);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid tags format' });
      }
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO items (item_id, user_id, category_id, title, description, condition, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7::text[])`,
        [item_id, user_id, category, title, description, condition, imagePaths]
      );

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
  }

  static async getUserItems(req, res) {
    try {
      const userId = req.user.id;

      const itemsQuery = `
          SELECT 
              i.item_id, 
              i.title, 
              i.description, 
              i.condition, 
              i.image, 
              ARRAY_AGG(DISTINCT t.tag_name) AS tag_names
          FROM items i
          LEFT JOIN item_tag_association ita ON ita.item_id = i.item_id
          LEFT JOIN item_tags t ON ita.tag_id = t.id
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
  }

  static async deleteItem(req, res) {
    const { item_id } = req.body;

    const imagesQuery = `SELECT * FROM items WHERE item_id = $1;`;
    const deleteItemQuery = `DELETE FROM items WHERE item_id = $1;`;
    const client = await pool.connect();
    try {
      const result = await client.query(imagesQuery, [item_id]);
      result.rows[0]?.image.forEach((filename) => {
        const img_url = path.join(__dirname, '..', filename);
        fs.unlink(img_url, (err) => {
          if (err) {
            console.log(`Image ${img_url} was not deleted`);
          } else {
            console.log(`Deleted image ${img_url}.`);
          }
        });
      });
      await client.query(deleteItemQuery, [item_id]);
      res.status(200).json({ message: 'Item deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    } finally {
      client.release();
    }
  }
}

export default ItemController;
