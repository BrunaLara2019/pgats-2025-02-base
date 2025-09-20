const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { authenticate } = require('../middleware/authMiddleware');

// Exige autenticação JWT
router.post('/', authenticate, checkoutController.checkout);

module.exports = router;

