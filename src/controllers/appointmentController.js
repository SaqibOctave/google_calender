const calendarService = require('../services/calendarService');

async function getAvailability(req, res) {
  const { date, duration } = req.query;
  const slots = await calendarService.getAvailableSlots(date, duration);
  res.json({ status: 'success', data: { date, slots } });
}

async function createAppointment(req, res) {

  console.log('Request body:', req.body); // Log the request body for debugging

  const appointment = await calendarService.createAppointment(req.body);
  res.status(201).json({ status: 'success', data: appointment });
}

async function listAppointments(req, res) {
  const appointments = await calendarService.listAppointments(req.query);
  res.json({ status: 'success', data: appointments });
}

async function getAppointment(req, res) {
  const appointment = await calendarService.getAppointment(req.params.eventId);
  res.json({ status: 'success', data: appointment });
}

async function rescheduleAppointment(req, res) {
  const appointment = await calendarService.rescheduleAppointment(req.params.eventId, req.body);
  res.json({ status: 'success', data: appointment });
}

async function cancelAppointment(req, res) {
  await calendarService.cancelAppointment(req.params.eventId);
  res.status(204).send();
}

module.exports = {
  getAvailability,
  createAppointment,
  listAppointments,
  getAppointment,
  rescheduleAppointment,
  cancelAppointment,
};
