# RESPONDR Mobile

Week 11-12 implementation baseline for resident mobile workflows.

## Implemented Scope

- Week 11:
  - Firebase email/password auth screens (`/login`, `/register`)
  - Auth hydration and backend `/auth/me` integration
  - Shared authenticated API client with token-refresh retry logic
  - Incident submission screen with:
    - category selection from `/incident-categories`
    - GPS capture (`expo-location`)
    - camera capture and attachment metadata registration (`/incidents/:id/attachments`)
- Week 12:
  - Alerts feed from `/alerts`
  - Push registration attempt via `/devices/register`
  - Foreground notification listener refresh behavior
  - Manual E2E checklist in `docs/WEEK12_MANUAL_E2E_CHECKLIST.md`

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npm run start
```

## Routes

- `/login`
- `/register`
- `/home`
- `/incident-create`
- `/alerts`
