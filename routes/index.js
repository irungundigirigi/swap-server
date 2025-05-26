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
router.post('/login', AuthController.login);
router.get('/validate-token', authenticateJWT, AuthController.validateToken);

// Items
router.get('/items/check-title', ItemController.checkTitle);
router.get('/items/categories', ItemController.getCategories);
router.get('/items/category-tags', ItemController.getCategoryTags);
router.post('/items/add', authenticateJWT, ItemController.addItem);
router.post('/items/add-upload', authenticateJWT, upload.array('images', 5), ItemController.addItemWithUpload);
router.get('/items/user', authenticateJWT, ItemController.getUserItems);
router.delete('/items/delete', authenticateJWT, ItemController.deleteItem);

// Listings
router.post('/listings/add', authenticateJWT, ListingController.createListing);

// Offers
router.post('/offers/add', authenticateJWT, OfferController.createOffer);

export default router;
