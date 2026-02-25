# RESPONDR Mobile (Expo)

Resident mobile app for RESPONDR built with Expo Router and React Native.

## Setup

1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npx expo start
```

## Styling and Cross-Platform Consistency

- Mobile theme is defined in `constants/theme.ts`.
- Shared visual tokens live in `../respondr-design-tokens/tokens.json` (sibling repo folder).
- Mobile component primitives are in `components/ui/` (`app-button`, `app-input`, `app-card`, `app-status-chip`).

### Rules

1. Use token values from `constants/theme.ts` in screens/components.
2. Avoid hardcoded colors/fonts in screen files.
3. Keep semantic status colors aligned with web (`pending`, `verified`, `in_progress`, `resolved`, `rejected`).
