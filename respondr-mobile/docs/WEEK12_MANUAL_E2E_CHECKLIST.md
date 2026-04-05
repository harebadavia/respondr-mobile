# Week 12 Manual E2E Checklist (v1)

## Setup

- Populate `.env` from `.env.example`.
- Run `npm install`.
- Start app with `npm run start`.
- Ensure backend API is reachable at `EXPO_PUBLIC_API_BASE_URL`.

## Auth

1. Register a resident account with valid fields.
Expected: success and redirect to Home.
2. Logout then login with the same credentials.
Expected: success and backend profile is loaded.
3. Try invalid credentials.
Expected: user-facing error message.

## Incident Submit

1. Open `Report Incident`.
2. Select one subcategory.
3. Capture current location.
4. Capture photo (jpeg/webp under 400KB).
5. Submit.
Expected: success toast/message and no crash.

Failure cases:
- Deny location permission -> shows location permission error.
- Deny camera permission -> shows camera permission error.
- Submit with missing title/description/category/location -> validation error.

## Alerts Feed

1. Open `View Alerts`.
Expected: alerts list loads or empty-state appears.
2. Force backend offline and refresh.
Expected: error state shown.
3. Restore backend and refresh.
Expected: list recovers.

## Push Handling (Current scope)

1. Ensure notifications permission prompt appears on authenticated session.
2. If permission granted, confirm device registration call is attempted.
3. If a push arrives while app is open, `Last push received` updates.

## Out of Scope While Semaphore Credits Are Blocked

- Live SMS send validation
- SMS reliability cycle
