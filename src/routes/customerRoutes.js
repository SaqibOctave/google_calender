const express = require('express');
const controller = require('../controllers/customerController');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateQuery } = require('../middleware/validate');
const { getCnicQuerySchema, updateCustomerSchema } = require('../validators/customerValidators');

const router = express.Router();

router.get('/', validateQuery(getCnicQuerySchema), asyncHandler(controller.getCustomer));
router.patch('/', validateQuery(getCnicQuerySchema), validateBody(updateCustomerSchema), asyncHandler(controller.updateCustomer));

module.exports = router;
