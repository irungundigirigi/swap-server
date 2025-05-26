import pool from '../db.js'

class ListingController {
  static async createListing(req, res) {
    const { listing_id, caption, category, item_ids, location } = req.body;
    const user_id = req.user.id;

    if (!location || typeof location.longitude !== 'number' || typeof location.latitude !== 'number') {
      return res.status(400).json({ error: 'Invalid or missing location data' });
    }

    const { longitude, latitude } = location;

    const addListingQuery = `
      INSERT INTO listing (listing_id, user_id, caption, location)
      VALUES($1, $2, $3, POINT($4, $5));
    `;

    const listingItemQuery = `
      INSERT INTO listing_item (listing_id, item_id)
      VALUES($1, $2);
    `;

    try {
      const client = await pool.connect();
      await client.query('BEGIN');

      await client.query(addListingQuery, [listing_id, user_id, caption, longitude, latitude]);

      if (item_ids && Array.isArray(item_ids)) {
        for (const itemId of item_ids) {
          await client.query(listingItemQuery, [listing_id, itemId]);
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Listing created successfully' });
      client.release();
    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to create listing', details: error.message });
    }
  }
}

export default ListingController;
