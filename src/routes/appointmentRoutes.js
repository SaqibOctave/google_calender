const express = require('express');
const controller = require('../controllers/appointmentController');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  availabilityQuerySchema,
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  listAppointmentsQuerySchema,
} = require('../validators/appointmentValidators');

const router = express.Router();

router.get('/availability', validateQuery(availabilityQuerySchema), asyncHandler(controller.getAvailability));

router.get('/', validateQuery(listAppointmentsQuerySchema), asyncHandler(controller.listAppointments));
router.post('/', validateBody(createAppointmentSchema), asyncHandler(controller.createAppointment));

router.get('/:eventId', asyncHandler(controller.getAppointment));
router.patch('/:eventId', validateBody(rescheduleAppointmentSchema), asyncHandler(controller.rescheduleAppointment));
router.delete('/:eventId', asyncHandler(controller.cancelAppointment));

module.exports = router;
