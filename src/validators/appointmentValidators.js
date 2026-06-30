const Joi = require('joi');

const availabilityQuerySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'date must be in YYYY-MM-DD format' }),
  duration: Joi.number().integer().min(5).max(480).optional(),
});

const createAppointmentSchema = Joi.object({
  summary: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).allow('').optional(),
  address: Joi.string().max(300).required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required().greater(Joi.ref('startTime')),
  attendeeEmail: Joi.string().email().required(),
  attendeeName: Joi.string().max(120).required(),
});

const rescheduleAppointmentSchema = Joi.object({
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required().greater(Joi.ref('startTime')),
});

const listAppointmentsQuerySchema = Joi.object({
  timeMin: Joi.date().iso().optional(),
  timeMax: Joi.date().iso().optional(),
});

module.exports = {
  availabilityQuerySchema,
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  listAppointmentsQuerySchema,
};
