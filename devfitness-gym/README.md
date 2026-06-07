# DEV FITNESS GYM MVP

This is a self-contained browser MVP built from the PRD for DEV FITNESS GYM, Bokaro Steel City.

## Run

Open `index.html` in a browser.

Demo login:

```text
admin / devfitness
```

## What Works

- Admin login with failed-attempt lockout
- Dashboard KPIs, collection totals, upcoming expiries
- Member registration wizard
- Member list with search and status filtering
- Member profile with health notes, payment history, reminders, and photo upload
- Signature upload and display
- Membership history preserved across renewals
- Manual payment status: Paid, Due, Pending
- In-app payment modal
- In-app membership renewal modal
- Member edit modal with manual Due override
- Payment ledger with CSV export
- Payment ledger with Payment IDs
- Reports with CSV, Excel-compatible XLS, and printable PDF export
- Reminder log simulation with duplicate prevention
- Plan price management
- Official V1 plan pricing from the final requirement freeze
- Gym services list in Settings
- Full JSON backup and restore

## Data Storage

The MVP stores data in browser `localStorage`. Use Settings -> Backup JSON before clearing browser data.

## Production Path

The `production/` folder now contains a backend and deployment scaffold:

- Local Node API with auth, members, payments, renewals, reminders, reports, and dashboard endpoints
- PostgreSQL target schema with append-only payment protections
- Docker and Cloud Run config
- CI workflow
- Core business-rule tests

The remaining migration is to replace the dependency-light API with NestJS modules and migrate this static frontend into Next.js + TypeScript + ShadCN.
