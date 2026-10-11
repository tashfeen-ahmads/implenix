# CRM webhook

Every lead the website captures is POSTed as JSON to `CRM_WEBHOOK_URL`.
One payload shape covers our in-house CRM and any client CRM: point the
URL at your own receiver, or at Zapier / Make / n8n to route into
HubSpot, GoHighLevel, Sheets, Slack, and so on.

## Events

| Event | Fired when | Source of `contact` |
|---|---|---|
| `lead.created` | The audit tool runs, or any form posts to `/api/leads` | Form fields |
| `booking.created` | A visitor books a slot in the calendar widget | Booking form |

A booking is never blocked by a CRM outage: the calendar event is
created first, then the webhook is sent. Failed deliveries are logged
server-side as `[crm] <event> <id> failed: <reason>`.

## Request

```
POST <CRM_WEBHOOK_URL>
Content-Type: application/json
User-Agent: Implenix-Webhook/1.0
X-Implenix-Event: booking.created
X-Implenix-Delivery: 3b1f0c9e-6a3d-4c58-9d6e-2f0d3c7a1b44
X-Implenix-Timestamp: 1791712800
X-Implenix-Signature: sha256=5d4c...   (when CRM_WEBHOOK_SECRET is set)
Authorization: Bearer <token>          (when CRM_WEBHOOK_TOKEN is set)
```

```json
{
  "id": "3b1f0c9e-6a3d-4c58-9d6e-2f0d3c7a1b44",
  "event": "booking.created",
  "created_at": "2026-10-11T14:00:00.000Z",
  "source": "homepage-demo-calendar",
  "page": "/",
  "contact": {
    "name": "Dana Whitfield",
    "email": "dana@whitfieldplumbing.com",
    "phone": "+1 614 555 0148"
  },
  "details": {
    "start": "2026-10-14T14:00:00.000Z",
    "end": "2026-10-14T14:30:00.000Z",
    "timezone": "America/New_York",
    "notes": "3 trucks, missing after-hours calls",
    "meeting_provider": "zoom",
    "meeting_url": "https://us06web.zoom.us/j/84512345678?pwd=...",
    "zoom_meeting_id": 84512345678,
    "calendar_event_id": "a1b2c3"
  }
}
```

`contact` always uses the same four optional keys: `name`, `email`,
`phone`, `company`. Everything else the form collected is in `details`
(for the audit tool: `industry`, `averageClientValue`).

`source` is the CTA location that produced the lead, for attribution.

## Responding

Return any `2xx` within 5 seconds. A network error or `5xx` is retried
once; `4xx` is not retried. Use `X-Implenix-Delivery` (equal to `id`)
to ignore duplicates.

## Verifying the signature

Set `CRM_WEBHOOK_SECRET` to a long random string on both sides. The
signature is an HMAC-SHA256 over `"<timestamp>.<raw request body>"`.
Verify against the raw body, before JSON parsing, and reject stale
timestamps to stop replays.

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(rawBody, headers, secret) {
  const ts = headers['x-implenix-timestamp'];
  const sig = headers['x-implenix-signature'] ?? '';
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const expected =
    'sha256=' + createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex');
  return sig.length === expected.length &&
    timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

## Testing locally

```bash
npm run crm:test-receiver           # terminal 1: prints every delivery
CRM_WEBHOOK_URL=http://localhost:4545 CRM_WEBHOOK_SECRET=dev-secret npm run dev
curl -X POST localhost:3000/api/leads -H 'Content-Type: application/json' \
  -d '{"source":"manual-test","data":{"name":"Test Lead","email":"test@example.com"}}'
```
