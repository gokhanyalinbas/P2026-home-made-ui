# Home Made

Home-cooked food marketplace for the Turkish community in the Netherlands. Mobile app for iOS + Android.
Stack: Expo (latest SDK) + TypeScript + Expo Router. UI first, with mock data; backend comes later.

## Source of truth
- Before every task, read `docs/UI_SPEC.md` and implement the relevant screen section exactly.
- If the spec is ambiguous or conflicts with these rules, ask before guessing.

## Mandatory rules
- Colors, spacing and fonts come only from theme tokens (spec §2). No hardcoded values.
- No hardcoded user-facing text: everything goes through i18n (tr default, en, nl).
- Use one icon library. Never use emoji as icons.
- Every screen supports loading (skeleton), empty, error (retry) and success states.
- Touch targets at least 44x44pt; add accessibility labels; contrast at least 4.5:1.
- Data goes through `src/api/*` interfaces; mock implementations for now.
- Router: Expo Router. Guest browsing is supported (Discover, Listing Detail, Seller Profile); protected actions open the Login Gate sheet.
- No Sign in with Apple. Google login needs a development build (not Expo Go).
- Store tokens in `expo-secure-store`, never AsyncStorage.
- Every ScrollView gets `style={{ flex: 1 }}`. Sticky action buttons must never be hidden by the keyboard.
- `expo-image-picker` v16: `mediaTypes: ['images']`. Do not use FlatList + scrollToIndex for onboarding.
- Tab screens do not unmount: reset forms manually after success.
- Install native packages with `npx expo install` so versions match the SDK.
- Validation rules live in one shared module (spec §1.2): password, NL postal code, +31 phone, 6-digit codes, price.

## Workflow
- Write a plan first and wait for my approval. Then implement.
- After each milestone: run on iOS and Android, then run accessibility-audit and design-critique.
- When done, list the files you changed and how I can test it.
- Keep commits small and scoped per screen or feature.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state and commands

Expo SDK 58 (React Native 0.88, React 19.3, TypeScript 6 strict) with Expo Router. Routes live in root `app/` (per spec §10); all non-route code goes in `src/{components/ui,features,api,i18n,theme,store,utils}`, imported via the `@/` alias (`@/theme` → `src/theme`). Deep link scheme: `homemade`. M0 foundation (theme, fonts, i18n, Zustand + TanStack Query, mock API, shared components) is not built yet.

```bash
npm start                 # expo start; open in Expo Go on a phone (no iOS simulator on this Windows machine)
npm run typecheck         # tsc --noEmit
npm run lint              # expo lint (sets up ESLint config on first run)
npx expo install <pkg>    # ALWAYS use for adding packages; picks SDK-compatible versions
npx expo-doctor           # dependency/config health check
npx expo export --platform android   # quick check that the JS bundle builds
```

Expo changes APIs every SDK release: check the versioned docs (`https://docs.expo.dev/versions/v58.0.0/`) instead of relying on memory. `ios/` and `android/` are generated (Continuous Native Generation) and gitignored; configure native behavior through `app.json` and config plugins. Libraries with native code not bundled in Expo Go need a development build.

Spec §12 Definition of Done applies to every screen.

## Architecture decisions spread across the spec

- **No roles.** Every user is a buyer, and becomes a seller by opening a first listing, which sets a unique kitchen name (normalized + Levenshtein ≤ 2 counts as a "too similar" warning).
- **Payment happens outside the app.** The app handles matching, orders, messaging and ratings. The seller subscription screen is a placeholder.
- **Order lifecycle:** `PENDING → CONFIRMED → DELIVERED`, or `CANCELLED`. Order numbers are `HM` + 6 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. The full address and phone are revealed only after CONFIRMED. Ratings are allowed only on DELIVERED orders, once per order, with separate product and seller scores.
- **Explore** filters strictly by country (NL only). It hides the user's own listings, inactive listings and out-of-stock listings. Proximity is a label (same postal-code area > same city > other), not km.
- **Notifications** arrive as `type + params`, and the text is rendered on the client through i18n so it follows language changes.
- Shared data types are in §6, and the shared validation rules (password, NL postal regex, +31 phone, character limits) are in §1.2.

## Known pitfalls from the previous app (§9, follow as written)

- Every `ScrollView` gets `style={{flex:1}}`, and bottom action buttons must stay visible.
- Onboarding: don't use FlatList + `scrollToIndex`. Use index state / PagerView.
- `expo-image-picker` v16: `mediaTypes: ['images']`.
- Tab screens don't unmount, so forms must be reset manually after a successful submit.
- Mark a conversation as read when it opens, so badges clear.
- Store tokens in `expo-secure-store`, never AsyncStorage.
- Google Sign-In needs a dev build (it doesn't work in Expo Go). The API base URL must come from env or a LAN IP, not `localhost`.
- Web is not a target (DateTimePicker has no web support).

## Installed project skills

`.claude/skills/` (tracked in `skills-lock.json`) contains `apple-design`, `design-taste-frontend`, `design-motion-principles`, `ui-ux-pro-max`. Several overlap. For this React Native app, prefer the native-oriented guidance (apple-design, motion principles), because `design-taste-frontend` targets marketing web pages.
