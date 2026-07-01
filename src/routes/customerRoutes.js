const express = require('express');
const controller = require('../controllers/customerController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', (req, res, next) => { console.log('[POST /api/customers] body:', req.body); next(); }, asyncHandler(controller.getCustomer));
router.patch('/', asyncHandler(controller.updateCustomer));

module.exports = router;
