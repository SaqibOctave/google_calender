const express = require('express');
const controller = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { createUserSchema } = require('../validators/userValidators');

const router = express.Router();

router.post('/', validateBody(createUserSchema), asyncHandler(controller.createUser));

module.exports = router;
