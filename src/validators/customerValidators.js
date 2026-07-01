const Joi = require('joi');

const getCnicBodySchema = Joi.object({
  cnic: Joi.string().length(13).pattern(/^\d{13}$/).required().messages({
    'string.length': 'CNIC must be exactly 13 digits',
    'string.pattern.base': 'CNIC must contain only digits',
  }),
});

const updateCustomerSchema = Joi.object({
  cnic: Joi.string().length(13).pattern(/^\d{13}$/).required().messages({
    'string.length': 'CNIC must be exactly 13 digits',
    'string.pattern.base': 'CNIC must contain only digits',
  }),
  complete_name: Joi.string().min(2).max(100),
  mother_name: Joi.string().min(2).max(100),
  date_of_birth: Joi.string().isoDate(),
  card_number: Joi.string().creditCard(),
  card_expiry: Joi.string().pattern(/^\d{2}\/\d{2}$/),
  cnic_expiry: Joi.string().isoDate(),
  card_pin: Joi.string().length(4).pattern(/^\d{4}$/),
  mobile_app_pin: Joi.string().length(4).pattern(/^\d{4}$/),
});

module.exports = { getCnicBodySchema, updateCustomerSchema };
