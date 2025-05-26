import pool from '../db.js'

class OfferController {
  static async createOffer(req, res) {
    const { offer_id, listing_id, offered_item_id } = req.body;
    const user_id = req.user.id;

    try {
      const insertOfferQuery = `
        INSERT INTO offer (offer_id, listing_id, offered_item_id, user_id)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertOfferQuery, [offer_id, listing_id, offered_item_id, user_id]);
      res.status(201).json({ message: 'Offer created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create offer', details: error.message });
    }
  }
}

export default OfferController;
