# API Reference

Base URL: `http://localhost:3001`

All routes except `/health`, `/auth/login`, and `/auth/logout` require the `devfitness_session` HttpOnly cookie.

## Auth

- `POST /auth/login`
- `POST /auth/logout`

```json
{
  "username": "admin",
  "password": "devfitness"
}
```

## Dashboard

- `GET /dashboard/stats`

Returns member counts, collection totals, recent payments, upcoming expiries, and recent registrations.

## Members

- `GET /members?search=&status=`
- `POST /members`
- `GET /members/:id`
- `PATCH /members/:id`

Member creation records the member, first membership, and first payment in one transaction-like store update.

## Payments

- `GET /payments?memberId=&mode=&dateFrom=&dateTo=`
- `POST /payments`

Payments are append-only. The production PostgreSQL schema prevents update/delete on `payments`.

## Renewals

- `POST /memberships/renew`

Creates a new membership and payment while preserving old membership history.

## Reminders

- `POST /reminders/run`
- `POST /reminders/send/:memberId`
- `GET /reminders/logs`

Runs the 7-day, 3-day, expiry-day, and expired reminder logic. Defaults to dry-run unless `WHATSAPP_DRY_RUN=false`.

## Reports

- `GET /reports/active-members`
- `GET /reports/due-members`
- `GET /reports/expiring-members`
- `GET /reports/expired-members`
- `GET /reports/monthly-collection`
- `GET /reports/payment-ledger`

Append `?format=csv` for CSV output.

## Uploads

- `POST /uploads/photo`
- `POST /uploads/signature`
- `GET /uploads/:filename`

Development payload:

```json
{
  "filename": "rahul.png",
  "dataUrl": "data:image/png;base64,..."
}
```

Production should replace local file writes with Google Cloud Storage signed URLs.
