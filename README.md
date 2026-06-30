# Google Calendar Appointment Booking API

Express API that books, lists, reschedules, and cancels appointments on a single
Google Calendar using a service account (no per-customer Google login required).

## 1. Google Cloud setup

1. Create/select a project at https://console.cloud.google.com.
2. Enable the **Google Calendar API** (APIs & Services → Library).
3. Create a **Service Account** (APIs & Services → Credentials → Create Credentials → Service Account).
4. Open the service account → **Keys** → **Add Key** → **Create new key** → JSON. Download it.
5. From the JSON, copy `client_email` and `private_key` into `.env`.
6. Open **Google Calendar** with the account that owns the business calendar.
   - Settings → select the calendar → **Share with specific people** → add the service
     account's `client_email` with **"Make changes to events"** permission.
   - Copy that calendar's **Calendar ID** (Settings → Integrate calendar) into `.env`.

## 2. Project setup

```bash
npm install
cp .env.example .env   # fill in GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID
npm run dev             # nodemon, http://localhost:4000
```

`GOOGLE_PRIVATE_KEY` must keep its `\n` escape sequences when stored as a single-line
env value; `src/config/env.js` converts them back to real newlines at startup.

## 3. API

All routes are mounted under `/api/appointments`.

| Method | Path                | Description                                   |
|--------|----------------------|------------------------------------------------|
| GET    | `/availability?date=YYYY-MM-DD&duration=30` | Open slots for a day |
| POST   | `/`                  | Create an appointment                          |
| GET    | `/`                  | List appointments (`?timeMin=&timeMax=`)       |
| GET    | `/:eventId`          | Get one appointment                            |
| PATCH  | `/:eventId`          | Reschedule (`startTime`, `endTime`)            |
| DELETE | `/:eventId`          | Cancel                                          |

### Create an appointment

```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Consultation with Jane Doe",
    "description": "Initial consultation",
    "startTime": "2026-07-02T10:00:00+05:30",
    "endTime": "2026-07-02T10:30:00+05:30",
    "attendeeEmail": "jane@example.com",
    "attendeeName": "Jane Doe"
  }'
```

The attendee receives a Google Calendar invite email automatically (`sendUpdates: 'all'`).

## 4. Notes on correctness

- Availability and booking both query `freebusy` against the live calendar — there's no
  separate database, so Google Calendar is the single source of truth.
- The create/reschedule flow does a check-then-insert against `freebusy`. This is not an
  atomic lock; under high concurrent booking volume for the same slot, add an
  application-level lock (e.g. a short-lived DB/Redis lock keyed by slot) in front of it.
- All scheduling math goes through `luxon` using the `TIMEZONE` env var, so business hours
  behave correctly regardless of server timezone.
