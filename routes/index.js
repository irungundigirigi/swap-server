import express from 'express';
import multer from 'multer';

import AuthController from '../controllers/Auth.js';
import ItemController from '../controllers/Item.js';
import ListingController from '../controllers/Listing.js';
import OfferController from '../controllers/Offer.js';

import authenticateJWT from '../middleware/authenticateJWT.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Auth
router.post('/auth/login', AuthController.login);
router.get('/api/validate-token', authenticateJWT, AuthController.validateToken);

// Items
router.get('/api/items', authenticateJWT,ItemController.getItems);
router.get('/api/items/check-title', ItemController.checkTitle);
router.get('/api/items/categories', ItemController.getCategories);
router.get('/api/items/category-tags', ItemController.getCategoryTags);
router.post('/api/items/add', authenticateJWT, ItemController.addItem);
router.post('/api/items/add-upload', authenticateJWT, upload.array('images', 5), ItemController.addItemWithUpload);
router.get('/api/items/user', authenticateJWT, ItemController.getUserItems);
router.delete('/api/items/delete', authenticateJWT, ItemController.deleteItem);

// Listings
router.get('/api/listings', authenticateJWT, ListingController.getListings)
router.post('/api/listings/add', authenticateJWT, ListingController.createListing);

// Offers
router.post('/api/offers/add', authenticateJWT, OfferController.createOffer);

export default router;
