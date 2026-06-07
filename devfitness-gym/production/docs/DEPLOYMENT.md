# Deployment Notes

## Local

```bash
npm install
npm test
npm start
```

API runs on `http://localhost:3001`.

Default local login:

```text
admin / devfitness
```

## Docker

```bash
cd infra
docker compose up --build
```

## Google Cloud Run Target

Recommended region: `asia-south1`.

Production services:

- API: Cloud Run
- Web: Cloud Run or static hosting
- Database: Cloud SQL PostgreSQL 15
- Uploads: Google Cloud Storage
- Secrets: Secret Manager
- Scheduler: Cloud Scheduler calling `/reminders/run` at 9:00 AM Asia/Kolkata

## Required Secrets

- `SESSION_SECRET`
- `ADMIN_PASSWORD_HASH`
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `DATABASE_URL`

## Next Migration Step

The current API uses JSON persistence so it can run without dependencies. A NestJS/PostgreSQL target also exists in `apps/api-nest`; after `npm install`, run it with:

```bash
npm run api:nest:dev
```

Run the Next.js target with:

```bash
npm run web:dev
```

Run E2E tests with:

```bash
npm run e2e
```
