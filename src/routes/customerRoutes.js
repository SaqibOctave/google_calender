const express = require('express');
const controller = require('../controllers/customerController');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { getCnicBodySchema, updateCustomerSchema } = require('../validators/customerValidators');

const router = express.Router();

router.post('/', validateBody(getCnicBodySchema), asyncHandler(controller.getCustomer));
router.patch('/', validateBody(updateCustomerSchema), asyncHandler(controller.updateCustomer));

module.exports = router;
