const Joi = require('joi');

const createUserSchema = Joi.object({
  cnic: Joi.string().length(13).pattern(/^\d{13}$/).required().messages({
    'string.length': 'CNIC must be exactly 13 digits',
    'string.pattern.base': 'CNIC must contain only digits',
  }),
  name: Joi.string().min(2).max(100).required(),
});

module.exports = { createUserSchema };
