import pool from '../db.js'

class ListingController {

  static async getListings(req,res) {
    try {
      const listingsQuery = `
        SELECT 
          l.listing_id, 
          l.created_at,
          l.updated_at,
          l.location,
          u.user_id, 
          u.name, 
          u.username, 
          u.profile_pic, 
          l.caption, 
          i.item_id,
          i.title, 
          i.description, 
          i.condition, 
          i.image,
          COUNT(DISTINCT o.id) AS offer_count,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT t.tag_name), NULL) AS tags
        FROM listing l 
        JOIN users u ON l.user_id = u.user_id 
        JOIN listing_item li ON l.listing_id = li.listing_id 
        JOIN items i ON li.item_id = i.item_id 
        LEFT JOIN item_tag_association ita ON ita.item_id = i.item_id
        LEFT JOIN item_tags t ON ita.tag_id = t.id
        LEFT JOIN offer o ON o.listing_id = l.listing_id
        GROUP BY l.listing_id, u.user_id, u.name, u.username, u.profile_pic, l.caption,
                 i.item_id, i.title, i.description, i.condition, i.image
        ORDER BY created_at DESC ;
      `;
  
      const result = await pool.query(listingsQuery);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No listings found' });
      }
  
      const listingsMap = {};
  
      result.rows.forEach(row => {
        if (!listingsMap[row.listing_id]) {
          listingsMap[row.listing_id] = {
            listing_id: row.listing_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            location: row.location,
            caption: row.caption,
            offer_count: parseInt(row.offer_count, 10),
            user: {
              user_id: row.user_id,
              name: row.name,
              username: row.username,
              profile_pic: row.profile_pic
            },
            items: []
          };
        }
  
        listingsMap[row.listing_id].items.push({
          item_id: row.item_id,
          title: row.title,
          description: row.description,
          condition: row.condition,
          image: row.image,
          tags: row.tags || []
        });
      });
  
      const listings = Object.values(listingsMap);
  
      res.json(listings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }

  }
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
