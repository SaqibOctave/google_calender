const { DateTime } = require('luxon');
const { getCalendarClient } = require('../config/googleClient');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const { calendarId } = env.google;
const { timezone, businessStartHour, businessEndHour, slotDurationMinutes } = env.scheduling;

// Joi's date validators convert request values into native JS Date objects,
// while other callers still pass raw ISO strings — handle both.
function toDateTime(value) {
  return value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(value);
}

/**
 * Fetches busy intervals for the calendar within [timeMin, timeMax].
 */
async function getBusyIntervals(timeMin, timeMax) {
  const calendar = getCalendarClient();
  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISO(),
      timeMax: timeMax.toISO(),
      timeZone: timezone,
      items: [{ id: calendarId }],
    },
  });

  const busy = data.calendars?.[calendarId]?.busy || [];
  return busy.map((b) => ({ start: DateTime.fromISO(b.start), end: DateTime.fromISO(b.end) }));
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Computes open slots of `durationMinutes` for the given calendar date,
 * inside configured business hours, excluding busy intervals and past slots.
 */
async function getAvailableSlots(dateStr, durationMinutes = slotDurationMinutes) {
  const dayStart = DateTime.fromISO(dateStr, { zone: timezone }).set({
    hour: businessStartHour,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const dayEnd = dayStart.set({ hour: businessEndHour });

  if (!dayStart.isValid) {
    throw new AppError('Invalid date', 400);
  }

  const busyIntervals = await getBusyIntervals(dayStart, dayEnd);
  const now = DateTime.now().setZone(timezone);

  const slots = [];
  let cursor = dayStart;

  while (cursor.plus({ minutes: durationMinutes }) <= dayEnd) {
    const slotEnd = cursor.plus({ minutes: durationMinutes });

    const isPast = cursor < now;
    const isBusy = busyIntervals.some((b) => overlaps(cursor, slotEnd, b.start, b.end));

    if (!isPast && !isBusy) {
      slots.push({ start: cursor.toISO(), end: slotEnd.toISO() });
    }

    cursor = slotEnd;
  }

  return slots;
}

/**
 * Books an appointment after re-confirming the slot is still free.
 * Note: this check-then-insert is not a true atomic lock; under heavy
 * concurrent load, add an application-level lock (e.g. DB row lock) in front of it.
 */
async function createAppointment({ summary, description, address, startTime, endTime, attendeeEmail, attendeeName }) {
  const start = toDateTime(startTime);
  const end = toDateTime(endTime);

  if (start < DateTime.now()) {
    throw new AppError('Cannot book an appointment in the past', 400);
  }

  const busyIntervals = await getBusyIntervals(start, end);
  const conflict = busyIntervals.some((b) => overlaps(start, end, b.start, b.end));
  if (conflict) {
    throw new AppError('Selected time slot is no longer available', 409);
  }

  // A bare service account (no Domain-Wide Delegation, unavailable on personal
  // Gmail calendars) cannot invite attendees, so customer info is kept on the
  // event itself instead of as a Calendar `attendees` entry.
  const customerLine = `Customer: ${attendeeName} <${attendeeEmail}>`;
  const fullDescription = description ? `${customerLine}\n\n${description}` : customerLine;

  const calendar = getCalendarClient();
  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description: fullDescription,
      location: address,
      start: { dateTime: start.toISO(), timeZone: timezone },
      end: { dateTime: end.toISO(), timeZone: timezone },
      extendedProperties: {
        private: { attendeeName, attendeeEmail },
      },
    },
  });

  return data;
}

async function listAppointments({ timeMin, timeMax } = {}) {
  const calendar = getCalendarClient();
  const { data } = await calendar.events.list({
    calendarId,
    timeMin: timeMin ? toDateTime(timeMin).toISO() : DateTime.now().toISO(),
    timeMax: timeMax ? toDateTime(timeMax).toISO() : undefined,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return data.items || [];
}

async function getAppointment(eventId) {
  const calendar = getCalendarClient();
  try {
    const { data } = await calendar.events.get({ calendarId, eventId });
    return data;
  } catch (err) {
    if (err.code === 404) {
      throw new AppError('Appointment not found', 404);
    }
    throw err;
  }
}

async function rescheduleAppointment(eventId, { startTime, endTime }) {
  const start = toDateTime(startTime);
  const end = toDateTime(endTime);

  const busyIntervals = await getBusyIntervals(start, end);
  // Exclude the appointment's own current slot from the conflict check.
  const existing = await getAppointment(eventId);
  const ownStart = DateTime.fromISO(existing.start.dateTime || existing.start.date);
  const ownEnd = DateTime.fromISO(existing.end.dateTime || existing.end.date);

  const conflict = busyIntervals.some(
    (b) => overlaps(start, end, b.start, b.end) && !(b.start.equals(ownStart) && b.end.equals(ownEnd))
  );
  if (conflict) {
    throw new AppError('New time slot is no longer available', 409);
  }

  const calendar = getCalendarClient();
  const { data } = await calendar.events.patch({
    calendarId,
    eventId,
    sendUpdates: 'all',
    requestBody: {
      start: { dateTime: start.toISO(), timeZone: timezone },
      end: { dateTime: end.toISO(), timeZone: timezone },
    },
  });

  return data;
}

async function cancelAppointment(eventId) {
  const calendar = getCalendarClient();
  try {
    await calendar.events.delete({ calendarId, eventId, sendUpdates: 'all' });
  } catch (err) {
    if (err.code === 404 || err.code === 410) {
      throw new AppError('Appointment not found', 404);
    }
    throw err;
  }
}

module.exports = {
  getAvailableSlots,
  createAppointment,
  listAppointments,
  getAppointment,
  rescheduleAppointment,
  cancelAppointment,
};
