# HOME MADE — UI Specification (Rebuild)

> This is the UI-first rebuild specification for **Home Made**, to be built prompt by prompt with Claude Code in the terminal. Overview first, then screen by screen. The backend will be discussed separately; the UI starts with **mock data**.
>
> **Target platforms:** iOS + Android (single codebase, Expo / React Native).
> **Languages:** TR (default), EN, NL. (This spec is in English; all UI copy shown here is example copy and must live in i18n files in all three languages.)

## Decisions Locked

- **Router:** Expo Router (file-based, built on react-navigation v7).
- **Guest browsing:** YES. Guests can view Discover, Listing Detail and Seller Profile. Ordering, messaging, listing and profile require login (redirect to Welcome/Login, then return to where they were).
- **Sign in with Apple:** NO. (Note: App Store Review Guideline 4.8 may require an equivalent privacy-focused login option if another third-party login such as Google is offered. Decide before submission: either keep Google and verify the rule, or ship email + password only.)
- **Subscription / payments:** deferred. Seller subscription screen is a placeholder.

---

## 0. Working Rules for Claude Code

Put this file at `docs/UI_SPEC.md` and reference it from `CLAUDE.md` (see the separate CLAUDE.md text).

Skills to use: Apple HIG / iOS design, Material 3 / Android design, Figma design-to-code, accessibility-audit, ux-writing, design-systems, interaction-design, design-critique. At the end of every milestone run `accessibility-audit` and `design-critique`.

---

## 1. Product Overview

**Home Made** is a home-cooked food marketplace for the Turkish community in the Netherlands. People who cook at home (sellers) post listings; nearby buyers discover them and place orders. **Payment happens outside the app** (cash, bank transfer, Tikkie, etc.). The app provides matching, order tracking, messaging and a trust layer (ratings and reviews).

**Revenue model:** monthly seller subscription. Buyers use the app for free. (Placeholder in UI; payment integration later.)

**Audience:** Turks living in the NL. Sellers: home cooks, mothers, students. Buyers: students missing home food, workers, families.

**Tone:** warm, friendly, neighborly, "mom's cooking". Short, clear, trustworthy copy. Informal address.

### 1.1 Core Product Decisions
- **No roles.** Everyone is both a buyer and a potential seller. "Becoming a seller" = creating the first listing (a kitchen name is chosen then).
- **Country:** only **Netherlands** is enabled for now; other countries appear greyed out as "Coming soon".
- **Email verification** is required to create a listing or place an order.
- **Kitchen name must be unique:** normalize (lowercase, strip accents/spaces) + Levenshtein distance ≤ 2 triggers a "a very similar kitchen name exists" block.
- **Order number:** `HM` + 6 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I). Example: `HM7K3PQ9`.
- **Order statuses:** `PENDING → CONFIRMED → DELIVERED`, or `CANCELLED`. A confirmation dialog appears before the seller sets DELIVERED.
- **Ratings:** only for `DELIVERED` orders, **once per order**. Product rating (listing average) and seller rating (kitchen average) are separate.
- **Delivery type:** `PICKUP` / `DELIVERY` / `BOTH`.
- **Discover:** country is a hard filter; sort by proximity (postal code > city > other) / rating / newest. **The user's own listings are hidden.**
- **Messaging:** buyer ↔ seller, tied to a listing or order. Opening a conversation marks it read.
- **Notifications:** in-app list + push (later). Deep link to the relevant screen.

### 1.2 Validation Rules (identical in every form)
| Field | Rule |
|---|---|
| Password | ≥ 8 characters, at least 1 letter + 1 digit |
| NL postal code | `^[1-9][0-9]{3}\s?[A-Za-z]{2}$` (normalize to `1234 AB`) |
| Phone | fixed `+31` prefix + 9 digits |
| Verification code | 6 digits, auto-advancing boxes |
| Price | > 0, max 2 decimals, € |
| Lengths (with live counter) | title 60, description 500, kitchen name 40, name 50, message 1000, review 500, bio 200, order note 300 |

---

## 2. Design System — "Hearth Warmth" (Ocak Sıcaklığı)

### 2.1 Color tokens
| Token | Hex | Use |
|---|---|---|
| `bg` | `#FAF3E7` | Screen background |
| `surface` | `#FFFFFF` | Cards, inputs, sheets |
| `surfaceAlt` | `#F3E6D3` | Chips, secondary background, skeleton |
| `border` | `#E5D5BB` | Dividers, input borders |
| `primary` | `#A8462F` | Primary button, active tab, links |
| `primaryDark` | `#6B3A2A` | Pressed state, dark emphasis |
| `accent` | `#D4A017` | Stars, badges, highlights |
| `textPrimary` | `#4A3527` | Main text |
| `textSecondary` | `#8A7A5C` | Secondary text, placeholders |
| `danger` | `#C0392B` | Errors, cancel, delete |
| `success` | `#5C7A4A` | Confirmation, delivered |

Status colors: PENDING = accent, CONFIRMED = primary, DELIVERED = success, CANCELLED = danger/grey.
Contrast: text on background ≥ 4.5:1 (check white on `primary`; use `primaryDark` if needed). No dark mode in v1 (keep tokens structured for it).

### 2.2 Typography
- Headings: **Playfair Display** (600/700). Body/UI: **Inter** (400/500/600). Load via `expo-font` + `@expo-google-fonts/*`.
- Scale: Display 32/38, H1 26/32, H2 20/26, H3 17/22, Body 15/22, Caption 13/18, Micro 11/14. Dynamic Type (iOS) / font scale (Android) supported; layout must not break at 1.3x.

### 2.3 Spacing / Radius / Shadow
- 4pt grid: 4, 8, 12, 16, 20, 24, 32, 40. Screen side padding 16.
- Radius: input 10, button 12, card 16, sheet top 18, chip 999, avatar 999.
- Shadow: one soft level (iOS shadow / Android elevation 2); separate cards mostly with `border`.

### 2.4 Icons
One set only: `lucide-react-native` or `@expo/vector-icons` (Feather). **Emoji as icons are forbidden** (inconsistent across platforms).

### 2.5 Shared components (`src/components/ui`)
`Button` (primary/secondary/ghost/danger, loading, disabled, full-width) · `TextField` (label, error, counter, right icon, show-password) · `OtpInput` (6 boxes) · `Select` (bottom-sheet list with search) · `PhoneField` (+31 fixed) · `PostalField` · `Chip` / `ChipGroup` · `Card` · `ListingCard` (compact, small image) · `Avatar` · `RatingStars` (display + input) · `StatusBadge` · `Badge` (unread count) · `Toast` · `Dialog` (confirm) · `BottomSheet` · `EmptyState` · `ErrorState` · `Skeleton` · `Header` · `SegmentedControl` · `ImagePickerGrid` · `Stepper` (quantity +/-) · `ScreenContainer` (SafeArea + keyboard avoidance + ScrollView with `flex:1`).

### 2.6 Motion and haptics
Transitions 200–300 ms, native stack animations. Button press: opacity/scale 0.98. Light haptic on success (`expo-haptics`). Respect reduce-motion. No decorative animation.

### 2.7 Accessibility
VoiceOver/TalkBack labels (`accessibilityLabel`, role), errors are announced, 44pt touch targets, color never the only carrier of meaning (status badge also has text).

---

## 3. Platform Notes (iOS + Android)
- Navigation: **Expo Router** (native stack + tabs). iOS swipe-back, Android system back.
- Safe area: `react-native-safe-area-context`. Android edge-to-edge, per-screen status bar style.
- Keyboard: `KeyboardAvoidingView` (iOS `padding`, Android `height`) or `react-native-keyboard-controller`.
- Date/time: iOS inline/compact picker, Android modal (`@react-native-community/datetimepicker`). Web is not a target.
- Image picker: `expo-image-picker` v16 → `mediaTypes: ['images']`. Permission strings in `app.json`, localized.
- Secure storage: tokens in **expo-secure-store** (not AsyncStorage).
- Google login does **not** work in Expo Go → use a **development build** + native Google Sign-In.
- Push permission: ask at the moment of need (after first order/listing), not during onboarding.
- Store requirements: report/block users, account deletion, privacy policy, terms — all present in the UI.

---

## 4. Information Architecture and Navigation

### 4.1 Flow tree (Expo Router groups)
```
Splash
 ├─ (first launch) Onboarding (3 slides) → Welcome
 ├─ (auth): Welcome → Login | Register → Email Verification → (if Google) Complete Profile
 │                    └ Forgot Password → Code → New Password
 └─ (tabs) 5 tabs  — guests can enter and browse Discover only
     1. Discover  → Filter Sheet → Listing Detail → Seller Profile → Place Order → Order Success
     2. Orders    → Placed/Received segment → Order Detail → Rate / Message
     3. Sell      → Listing Form (create/edit) → Preview
     4. Messages  → Chat
     5. Profile   → Edit Profile · My Listings · Language · Notification Settings · Subscription · Legal · Account
 Global: Notifications (bell in Discover and Profile headers) · Block/Report sheet
```

### 4.2 Bottom tab bar
5 tabs: **Discover** (search), **Orders** (receipt), **Sell** (plus, center, emphasized), **Messages** (message, unread badge), **Profile** (user). Active: `primary`, inactive: `textSecondary`. Labels always visible. Tabs do **not unmount** → reset the Sell form manually after success. For guests, tapping Orders/Sell/Messages/Profile opens a login prompt sheet ("Log in to continue") instead of navigating.

### 4.3 Deep links
`homemade://listing/:id`, `homemade://order/:id`, `homemade://chat/:conversationId`, `homemade://verify-email?token=`, `homemade://reset-password?token=`. Notification type → target screen mapping is in the Notifications section.

---

## 5. Global Behaviors
- **Session:** token in SecureStore; validated on splash; 401 → go to login. Guest state is a first-class state (`session = null`).
- **Login gate:** any protected action by a guest opens a "Log in or create an account" sheet; after login, return to the original screen and continue the action.
- **Loading/Empty/Error:** every list has a skeleton (3 cards), an empty state with illustration + CTA, and an error state with "Try again".
- **Offline:** thin banner "No internet connection"; write actions disabled.
- **Pull-to-refresh** on all lists. Infinite scroll on Discover, Messages, Orders (page size 20).
- **Toast vs Dialog:** small success → toast; irreversible/important → dialog; order success → full screen + dialog.
- **Unverified email:** on listing/order actions show an "Verify your email" sheet (enter code / resend).
- **Language:** device language on first launch (TR/EN/NL, fallback TR); changed from Profile, applied instantly.
- **Formats:** money `€ 12,50` (NL format via `Intl`), date `15 Mar 2026`, time 24h.
- **Proximity:** no real km; label as "Same area / Same city / Elsewhere".

---

## 6. Data Models (UI-side TypeScript types)

```ts
type User = { id; email; emailVerified: boolean; firstName; lastName; phone?; avatarUrl?;
  country: 'NL'; city; postalCode; kitchenName?: string; bio?: string; language: 'tr'|'en'|'nl';
  sellerRating?: number; sellerReviewCount?: number; createdAt };

type Listing = { id; sellerId; seller: Pick<User,'id'|'kitchenName'|'avatarUrl'|'sellerRating'|'city'>;
  title; description; category: Category; priceCents: number; unit: 'portion'|'piece'|'kg'|'tray';
  stock: number|null; images: string[]; deliveryType: 'PICKUP'|'DELIVERY'|'BOTH';
  pickupCity; pickupPostalCode; availableFrom?; availableUntil?; allergens?: string[];
  active: boolean; rating?: number; reviewCount: number; createdAt };

type Order = { id; number: string /* HM7K3PQ9 */; listingSnapshot: {title; imageUrl; priceCents; unit};
  buyerId; sellerId; quantity; totalCents; deliveryType: 'PICKUP'|'DELIVERY';
  requestedDate; requestedTime?; note?; deliveryAddress?; status: 'PENDING'|'CONFIRMED'|'DELIVERED'|'CANCELLED';
  cancelReason?; reviewed: boolean; createdAt; updatedAt };

type Review = { id; orderId; listingId; sellerId; buyerName; productRating: 1..5; sellerRating: 1..5; comment?; createdAt };
type Conversation = { id; participant: UserLite; listingRef?; orderRef?; lastMessage; unreadCount; updatedAt };
type Message = { id; conversationId; senderId; text; createdAt; readAt? };
type Notification = { id; type: 'ORDER_NEW'|'ORDER_CONFIRMED'|'ORDER_DELIVERED'|'ORDER_CANCELLED'|'REVIEW_RECEIVED'|'MESSAGE_NEW'|'EMAIL_VERIFIED'; params: Record<string,string>; read: boolean; createdAt };
type Category = 'MAIN'|'SOUP'|'PASTRY'|'APPETIZER'|'DESSERT'|'BREAKFAST'|'PICKLE'|'DRINK'|'OTHER';
```
Notification text arrives as **type + params**; the client renders text from i18n (so it follows language changes).

**Mock data suggestion:** 12 listings (5 kitchens, 3 cities: Amsterdam/Rotterdam/Utrecht), 6 orders (every status), 3 conversations, 8 notifications, 2 users (one seller). Images from local assets or picsum.

---

## 7. Screens — Screen by Screen

For each screen: **Purpose · Layout · Fields/Validation · States · Interactions · Platform notes**.

---

### A. AUTH FLOW

#### A1. Splash
- **Purpose:** check session, load fonts.
- **Layout:** `bg` background, centered logo (hearth/pot icon) + "Home Made" in Playfair Display (Display size), thin `primary` spinner below.
- **Logic:** valid token → Tabs. No token & first launch → Onboarding. No token → Tabs as guest (Discover) or Welcome (see A3). Max 1.5 s; shorter if fonts are ready.
- **Platform:** native splash (`expo-splash-screen`) uses the same color/logo for a seamless handoff.

#### A2. Onboarding (3 slides, first launch only)
- **Layout:** "Skip" top right. Middle: illustration (55% of height). Bottom: title (H1) + 2-line description. Dot indicator + "Next" button (last slide: "Get started").
- **Slides:** (1) "The neighborhood's flavors, at your door" — discover nearby home-cooked food. (2) "Cook and share" — open your kitchen, post a listing. (3) "Order with trust" — ratings, messaging, you handle payment.
- **Tech:** do **not** use FlatList + scrollToIndex (fails silently). Use an `index` state or `PagerView`; text must change per slide (old bug).
- **End:** `onboardingSeen=true` saved → Welcome.

#### A3. Welcome
- **Layout:** logo on top, tagline, then: **"Log in"** (primary), **"Create account"** (secondary), "Continue with Google" (outline, Google logo). **No Apple button.** A prominent text button **"Browse first"** (guest mode) → Discover. Footer: "By continuing you accept the Terms of Use and Privacy Policy" (links).
- **Language switch:** small TR/EN/NL top right.

#### A4. Login
- **Fields:** Email (email keyboard, autoCapitalize none), Password (show/hide). "Forgot password?" link on the right.
- **Validation:** email format, password not empty. Errors under the field; on submit focus the first invalid field.
- **Button:** "Log in" (spinner while loading, double-tap prevented). Below: "No account? Sign up".
- **Errors:** wrong credentials → red banner above the form "Email or password is incorrect"; network error → toast.
- **Success:** return to the screen the guest came from, else Discover. An unverified email can still log in; restrictions apply at action time.

#### A5. Register
- **Layout:** title "Create account". Scrollable form (`ScrollView style={{flex:1}}`), submit button at the end of the form.
- **Fields (in order):** First name · Last name · Email · Password (live rule indicator beneath: 8+ characters, letter, digit) · Confirm password · Country (Select: Netherlands active, others greyed "Coming soon") · City (Select, NL cities, searchable) · Postal code (NL regex, auto-uppercase/spacing) · Phone (`+31` fixed + 9 digits) · Checkbox: Terms/Privacy (required).
- **Select:** BottomSheet list + search, closes on selection, selected item marked (not the native picker).
- **Validation:** on blur + on submit; rules in §1.2. Passwords must match.
- **Success:** account created → Email Verification (A6).
- **Errors:** email already registered → error under the email field.

#### A6. Email Verification
- **Layout:** envelope icon, "Verify your email", "We sent a 6-digit code to `name@mail.com`". 6-box `OtpInput` (auto-advance, paste support, iOS `oneTimeCode` / Android autofill).
- **Interaction:** auto-verify when the 6th digit is entered. "Resend" with 60 s countdown. "Change email" link. "Do it later" (ghost) → Tabs (restricted).
- **Error:** wrong/expired code → boxes shake (error haptic), red message. After 5 wrong attempts: wait 5 minutes message.
- **Success:** check animation → toast "Email verified" → Tabs.

#### A7. Forgot Password (3 separate screens)
1. **Enter email** → "Send code". Always a neutral response ("If an account exists, we sent a code") — no account enumeration.
2. **Enter code** (OtpInput) → verify.
3. **New password** (+ confirm, rule indicator) → "Update password" → Login screen + toast.

#### A8. Complete Profile (for Google sign-ins)
- **Why:** social login does not provide country/city/postal code/phone.
- **Fields:** Country · City · Postal code · Phone (same rules as Register). First/last name prefilled, editable.
- **Mandatory:** no back; cannot enter the app until completed. Success → Tabs.

---

### B. DISCOVER (Tab 1)

#### B1. Discover Home
- **Header:** left: "Hi, {firstName}" (no emoji; guests see "Welcome") + a location chip below "Amsterdam · 1012 AB" (tap → Location Sheet). Right: bell icon (unread badge; hidden for guests).
- **Search bar:** search icon on the left, placeholder "Search food, kitchen or city"; next to it a Filter button (badge with active filter count). 400 ms debounce.
- **Category chips:** horizontal scroll (All, Main dish, Soup, Pastry, Appetizer, Dessert, Breakfast, Pickles, Drinks, Other). Single select.
- **Sort:** small text button "Sort: Nearest ▾" → ActionSheet (iOS) / BottomSheet (Android): Nearest · Top rated · Newest.
- **List:** single-column `FlatList` of **compact ListingCard** (image 88×88, radius 12). Card: image · title (1 line) · kitchen name + city · rating (star + number + count) · price (€ and unit) · delivery icon(s) (pickup/delivery). Top-right tag "Same area" when applicable.
- **Rules:** country is a hard filter (user's country; guests: NL); **own listings are hidden**; inactive/out-of-stock listings hidden; proximity order: same 4-digit postal area > same city > other, ties broken by rating.
- **States:** Skeleton (5 cards) · Empty: "No listings near you yet" + "Be the first to post" CTA · No search results: "No results found", clear filters · Error: try again.
- **Interactions:** tap card → Listing Detail. Pull-to-refresh. Infinite scroll.

#### B2. Filter Sheet (BottomSheet, 75% height)
- **Fields:** Delivery type (multi-chip: Pickup, Delivery) · City (Select) · Price range (min/max input or slider) · Minimum rating (1–5 stars) · Available today/tomorrow (switch).
- **Bottom bar:** "Clear" (ghost) and "Show {n} results" (primary).

#### B3. Location Sheet
- Edit city + postal code (session filter only; does not change the profile location) or "Use my profile location". Validation: NL postal regex.

#### B4. Listing Detail
- **Top:** image gallery (full width, 4:3, swipe, dot indicator, full-screen zoom). Top-left back, top-right share + (for others' listings) "⋯" menu (Report).
- **Content (ScrollView):** Title (H1 Playfair) · Price large (`€ 8,50 / portion`) · Rating row (stars, average, review count → scroll to reviews) · Tags: category, delivery type, stock ("Only 3 left") · Description (Show more after 4 lines) · Allergen info (if any, warning box) · Availability ("Available from today") · Pickup point: city + first 4 digits of postal code (full address shown to the buyer only **after the order is confirmed**) · **Seller card** (avatar, kitchen name, seller rating, city; tap → Seller Profile) · **Reviews** section (product rating = listing average; last 3 reviews + "See all").
- **Sticky bottom bar:** left price, right **"Order"** (primary). If the seller views their own listing: "Edit" + "Deactivate". Stock 0 → disabled "Sold out".
- **Secondary action:** "Send message" (outline, in the seller card).
- **Gates:** guest → login sheet; unverified email → verification sheet.

#### B5. Seller Profile
- Header: large avatar, kitchen name (H1), city, "Member since March 2026", seller rating + review count, bio. Buttons: "Send message", "⋯" (Block/Report).
- Tabs: **Listings** (compact card list) · **Reviews** (seller rating average + list).
- Stats row: completed orders, average rating.

#### B6. Reviews List
- Summary on top: large average, 5–1 star distribution bars. List: reviewer first name + last initial, date, **product rating** and **seller rating** shown separately with labeled icons, comment. Sort: Newest / Highest / Lowest.

---

### C. ORDERING FLOW

#### C1. Place Order (a screen, not a modal sheet)
- **Top summary card:** small image, title, kitchen name, unit price.
- **Fields:**
  - **Quantity** (Stepper −/+, between 1 and stock, long-press accelerates).
  - **Delivery type** (SegmentedControl; options follow the listing; fixed if only one).
  - **Date** (DateTimePicker; from today, within listing availability; iOS inline, Android modal) and **time window** (chips: 12–14, 14–16, 16–18, 18–20, or custom time).
  - **Delivery address** (DELIVERY only): prefilled from profile, editable (street, number, postal code, city). Postal regex required.
  - **Note to seller** (optional, 300 chars, counter).
- **Price summary:** subtotal = quantity × unit price; info box "Payment is made to the seller on handover (outside the app)"; total in bold.
- **Sticky bottom button:** "Send order" (loading). Duplicate-order protection.
- **Validation:** quantity ≥ 1 and ≤ stock; date not in the past; address required for DELIVERY.
- **Errors:** insufficient stock → under-field message + current stock; listing removed → dialog + back to Discover.

#### C2. Order Success
- Full screen confirmation: green check animation, "Your order was sent", **order number large** (`HM7K3PQ9`, copy icon), summary line, "You'll get a notification when the seller confirms".
- Buttons: **"Go to my orders"** (primary → Orders / Placed segment, new order at top and highlighted) · "Message the seller" (secondary) · "Back to Discover" (ghost).
- (Missing in the old build: redirect to My Orders after success + success dialog — part of this design.)

---

### D. ORDERS (Tab 2)

#### D1. Orders List
- **Top:** SegmentedControl **"Placed" | "Received"** ("Received" only if the user is a seller; otherwise hidden and the empty state offers a "Become a seller" CTA). In each segment, status filter chips: Active (PENDING+CONFIRMED) · History (DELIVERED+CANCELLED).
- **Sort:** Active → nearest delivery date first; History → newest first.
- **Card:** order number (small), listing title + small image, quantity × unit, total, date/time, counterpart name (kitchen name for buyers, buyer name for sellers), **StatusBadge**. Dot for unseen status changes.
- **Empty:** "You have no orders yet" + Discover CTA.

#### D2. Order Detail
- **Top:** order number (copyable) + large StatusBadge. **Status timeline** (Sent → Confirmed → Delivered; cancelled = red branch) with date/time stamps.
- **Sections:** Listing summary (tap → Listing Detail) · Quantity/Total · Delivery type, date/time, address (the buyer sees the full pickup address **after CONFIRMED**) · Note · Counterpart card (avatar, name, "Send message", a "Call" button only after CONFIRMED).
- **Seller actions (sticky bottom):**
  - PENDING: **"Confirm"** (primary) · **"Decline"** (danger outline → reason sheet: Out of stock, Not available, Other).
  - CONFIRMED: **"Mark as delivered"** → **confirmation dialog** "Are you sure you want to mark this order as delivered? This cannot be undone." (Cancel / Yes, delivered).
- **Buyer actions:**
  - PENDING: **"Cancel order"** (confirmation dialog). CONFIRMED: "Contact the seller to cancel" (open decision: can the buyer cancel when CONFIRMED?).
  - DELIVERED + `reviewed=false`: **"Rate"** (primary) → E1.
  - DELIVERED + `reviewed=true`: shows the given rating read-only.
- **Race condition:** if the other side changed the status, show a dialog "Order updated" + refresh.

---

### E. RATINGS

#### E1. Rate Order (full-screen modal)
- **Precondition:** `DELIVERED` only, **once per order**.
- **Layout:** listing summary. Two independent sections: **"How was the food?"** (product rating, 1–5 large tappable stars) and **"How was the seller?"** (seller rating, 1–5: communication, on-time handover). Comment (optional, 500 chars, counter).
- **Button:** "Submit" (disabled until both ratings are set). Success → toast "Thank you!" → Order Detail (rating read-only).
- **Effect:** product rating feeds the listing average; seller rating feeds the kitchen average.

---

### F. SELL (Tab 3)

#### F1. Entry Gate
First-time sellers (no kitchen name): a short **"Open your kitchen"** sheet — 3 points (what to expect, payment is outside the app, subscription info) + "Start". Email verification is checked first.

#### F2. Choose Kitchen Name (once, before the first listing)
- Field: Kitchen name (max 40). Live uniqueness check (debounced): "Available" / "This name is taken" / "A very similar name exists: 'Ayse's Kitchen'" (Levenshtein ≤ 2, blocking).
- Extra: short bio (optional, 200), profile photo (optional).

#### F3. Listing Form (Create / Edit — same screen)
- **Layout:** title "New listing" / "Edit listing". `ScrollView style={{flex:1}}`, sectioned cards, sticky bottom "Publish" button (never hidden by the keyboard).
- **Section 1 — Photos:** ImagePickerGrid, 1–5 images, first is the cover (drag / "make cover"). Source: Camera / Library. Compression (long edge 1600, quality 0.8). Permission denied → explanatory text with a link to settings.
- **Section 2 — Basics:** Title (60) · Category (Select) · Description (500, multiline, counter).
- **Section 3 — Price & stock:** Price (€, >0, 2 decimals) · Unit (Select: portion/piece/kg/tray) · Stock (number, empty = unlimited).
- **Section 4 — Delivery:** Type (SegmentedControl: Pickup / Delivery / Both) · City (**default: profile city**) · Postal code (**default: profile postal code**) · Availability (start/end date, optional).
- **Section 5 — Extra:** Allergens (multi-chip: gluten, milk, egg, nuts, sesame, soy, fish) — optional.
- **Validation:** at least 1 photo, title, category, price, unit, delivery type, city, postal code required. Scroll to and focus the first invalid field.
- **Buttons:** "Preview" (ghost) and "Publish" (primary). In edit mode: "Delete listing" (danger, confirm) and "Deactivate/Activate".
- **Success:** Publish → success sheet "Your listing is live" + [View listing] [Add another] → the form is **reset manually** (tabs do not unmount). Edit: save → back + toast.
- **Exit protection:** with unsaved changes, back/tab switch shows "Discard draft?" dialog; auto-saved drafts are a v1.1 option.

#### F4. Listing Preview
Exact rendering of Listing Detail with a top band "This is how it will look", bottom: "Edit" / "Publish".

---

### G. MESSAGES (Tab 4)

#### G1. Conversation List
- Row: avatar, counterpart (kitchen name for buyers / buyer name for sellers), last message (1 line), time (today: clock, yesterday: "Yesterday", else date), unread badge (primary circle with count). Unread rows in bold. Small context label: "Listing: Manti" or "Order: HM7K3PQ9".
- Swipe to delete/archive (iOS swipe, Android long-press menu) — v1.1.
- Empty: "No messages yet" + explanation.

#### G2. Chat
- **Header:** back, avatar + name (tap → profile), "⋯" (Block/Report). Below it a context card (mini listing or order summary, tappable).
- **List:** inverted FlatList; bubbles: mine = `primary` background, white text, right; theirs = `surface`, left. Date separators. Send state (sending / failed → retry). Read tick.
- **Input bar:** multiline input (max 1000), send button (disabled when empty), correct keyboard avoidance.
- **Rules:** opening the screen **marks the conversation read** (badge resets, tab badge updates). Auto-scroll to bottom on new message. Blocked users cannot be messaged (info text replaces the input).
- **Live data:** 5 s polling at first (mock), WebSocket later.

---

### H. PROFILE (Tab 5)

#### H1. Profile Home
- **Top card:** avatar (tap → change), full name, email + verification badge (if unverified: warning row + "Verify"), kitchen name (if any), seller rating. "Edit profile" button.
- **Stats row:** Orders placed · Orders received · Rating. (Open decision: count cancelled orders? Recommendation: no.)
- **Menu groups:**
  - **My account:** Edit profile · Address/location · Change password
  - **My kitchen** (sellers): My listings · Received orders (shortcut) · Subscription
  - **App:** Language · Notification settings · Blocked users
  - **Support:** Help/FAQ · Contact us · Terms of Use · Privacy Policy
  - **Log out** · **Delete account** (danger, at the bottom)
- Version number in the footer.

#### H2. Edit Profile
Fields: Photo · First name · Last name · Phone (+31) · City · Postal code · Bio (seller, 200) · Kitchen name (**changing it re-runs the uniqueness rule**). Email read-only (change flow is v1.1). The Save button must stay **visible** (old bug: ScrollView `flex:1`). Disabled when nothing changed.

#### H3. My Listings
- List (compact card + status: Active/Inactive/Sold out). Filter chips on top. Per row: Edit, Deactivate/Activate, Delete. "+ New listing" on top. Empty: "Post your first listing".
- Indicator of pending orders per listing (e.g., "2 new orders").

#### H4. Change Password
Current password · New password (rule indicator) · Confirm. Success → toast. For social-login users: "Set a password" flow (via email code).

#### H5. Language
Radio list: Türkçe · English · Nederlands. Applies instantly and persists.

#### H6. Notification Settings
Switches: Order updates · New messages · New orders (seller) · Ratings/reviews. If the system permission is off, a top row "Turn on notifications" deep-links to system settings.

#### H7. Subscription (placeholder; no payment in v1)
Plan card: "Seller Plan — € X/month", bullet list, trial info, status (Trial/Active/Expired). Button "Coming soon". (Store rule: digital subscriptions may require IAP / Play Billing — to be decided in the backend discussion.)

#### H8. Blocked Users
List + "Unblock". Empty state.

#### H9. Help / FAQ & Contact
Accordion FAQ (How do I order? How does payment work? How do I become a seller? Cancellations?). "Contact us" → email compose. Version info.

#### H10. Delete Account
Warning screen: what is deleted / what stays (orders become anonymized), confirm with password/code, "Permanently delete my account" (danger), blocked if there are active orders (with explanation).

---

### I. GLOBAL SCREENS

#### I1. Notifications
- Bell in Discover + Profile headers. List: icon (by type), text (type+params → i18n), relative time, unread dot. "Mark all as read" on top.
- **Deep link mapping:** ORDER_* → Order Detail · MESSAGE_NEW → Chat · REVIEW_RECEIVED → Seller reviews · EMAIL_VERIFIED → Profile.
- Empty: "No notifications". Tapping marks as read.

#### I2. Report / Block Sheet
Options: Block · Report → reason list (Inappropriate content, Fake listing, Harassment, Food safety, Other) + optional text → Submit → toast. Blocking is confirmed; blocked users' listings disappear from Discover and messaging is closed.

#### I3. Email Verification Sheet
Appears on restricted actions (listing/order): explanation + "Enter code" (OtpInput) + "Resend". On success the sheet closes and the user returns to where they were.

#### I4. Login Gate Sheet (guests)
Appears when a guest taps a protected action: "Log in to continue" + [Log in] [Create account] [Continue with Google] + "Not now". After login, return to the original screen/action.

#### I5. Shared Dialog/Toast Copy
Success: "Saved", "Listing is live", "Order sent". Error: "Something went wrong. Try again.", "No internet connection". Confirm: cancel/delete/delivered. All under `common.*` i18n keys.

---

## 8. Critical End-to-End Flows

1. **Buyer:** Register → verify code → Discover → Listing Detail → Place Order → Success (number HM…) → Orders/Placed (PENDING) → seller confirms (notification) → CONFIRMED (full address/phone unlock) → seller delivers → DELIVERED → notification → Rate → listing and seller averages update.
2. **Seller:** Sell tab → Open your kitchen → kitchen name → Listing Form → Publish → incoming order notification → Order Detail → Confirm → after handover "Mark as delivered" (confirm dialog) → review notification.
3. **Guest:** Welcome → "Browse first" → Discover → Listing Detail → "Order" → Login Gate → Login → back to the same listing, order flow continues.
4. **Google sign-in:** Welcome → native Google → (first time) Complete Profile → Tabs.
5. **Password reset:** Login → Forgot password → code → new password → Login.
6. **Messaging:** Listing/Order → "Send message" → Chat (context card) → mark-as-read.

---

## 9. Lessons from the Old Build (apply exactly)

| Problem | Rule |
|---|---|
| Save button not visible | Every `ScrollView` gets `style={{flex:1}}`; sticky button outside the ScrollView or via `contentContainerStyle` padding |
| Onboarding text did not change | No FlatList + scrollToIndex; index state / PagerView |
| Image picker did nothing | `expo-image-picker` v16: `mediaTypes: ['images']` |
| `Unable to convert string to floating point value: 'large'` | Native package version mismatch (react-navigation / screens). Use `npx expo install` for SDK-compatible versions |
| Form not cleared after success | Tabs do not unmount → reset manually |
| Message badge never reset | Mark conversation read on open |
| Google login `exp://` redirect error | Not possible in Expo Go → dev build + native Google Sign-In |
| `localhost` unreachable from phone | LAN IP / env-based API base URL |
| Back button option name | react-navigation v7: `headerBackButtonDisplayMode` |
| Token in AsyncStorage | SecureStore |
| Emoji as icons | Icon library |
| DateTimePicker has no web implementation | Web is not a target |
| SMTP blocked login (backend) | Send email asynchronously |

---

## 10. Roadmap and Claude Code Prompt Templates

Every milestone: plan → code → run on iOS + Android → `accessibility-audit` → `design-critique` → commit.

**M0 — Foundation (1 day):** latest Expo SDK + TypeScript + **Expo Router**, ESLint/Prettier, folder structure (`app/` for routes, `src/{components/ui,features,api,i18n,theme,store,utils}`), theme tokens, fonts, i18n (tr/en/nl; namespaces `common, auth, explore, orders, listing, chat, profile, notifications, errors`), mock API layer, state (Zustand + TanStack Query), session store supporting guest.
> Prompt: *"Following docs/UI_SPEC.md §2, create the theme tokens, fonts and the shared UI components from §2.5 under src/components/ui. Add a /dev/components route that showcases them. No hardcoded colors."*

**M1 — Auth (A1–A8):** splash, onboarding, welcome (with "Browse first"), login, register, OTP, password reset, complete profile (mock).
> Prompt: *"Implement the §7-A screens. Selects are BottomSheet + search. Validation per §1.2. Mock auth service. All text in i18n. Guest mode per §5."*

**M2 — Discover & Detail (B1–B6):** list, search, filters, sort, detail, seller profile, reviews. Guests can browse.
**M3 — Orders (C, D, E):** place order, success, lists, detail, actions, rating.
**M4 — Sell (F) & My Listings (H3).**
**M5 — Messages (G) & Notifications (I1).**
**M6 — Profile (H) & Settings, report/block, delete account.**
**M7 — Polish:** empty/error/loading states everywhere, accessibility, motion, small screens (iPhone SE, 360dp Android), dynamic font.
**M8 — Backend integration** (separate discussion): mock API → real API, auth, push, deep links, dev build (Google), TestFlight + Play internal testing.

**Tip:** append to every prompt: *"Write a plan first and wait for my approval. Then implement. When done, list the files you changed and how I can test it."*

---

## 11. Open Decisions

Resolved: router (Expo Router), guest browsing (yes), Sign in with Apple (no), subscription (later).

1. **App name / trademark** check for "Home Made".
2. **Google login vs App Store rule 4.8** (see Decisions Locked).
3. **Tab layout:** 5 tabs with centered "Sell" (recommended). Alternative: 4 tabs, Sell inside Profile/Orders.
4. **Order status history** (timeline) and **when the buyer may cancel**.
5. **Full address visibility:** after CONFIRMED (recommended).
6. **Notification i18n:** type + params (recommended).
7. **Phone OTP** against multi-account abuse (v1.1).
8. **First-listing seller-readiness sheet** (food hygiene / legal note; get legal advice on NVWA / KvK obligations).
9. **Allergen and unit fields:** required or optional.
10. **Cancelled orders** in the stats or not.
11. **Subscription:** IAP / Play Billing vs web payment (store rules) — later.

---

## 12. Definition of Done (per screen)

- [ ] All text in 3 languages, no overflow (test long Dutch words)
- [ ] Loading / empty / error / success states exist
- [ ] Run on iOS and Android (at least iPhone SE + large iPhone, small + large Android)
- [ ] Keyboard never hides fields/buttons; Save/Submit always reachable
- [ ] 44pt touch targets, VoiceOver/TalkBack labels, contrast ≥ 4.5:1
- [ ] Theme tokens only; icon library; no emoji
- [ ] Double-tap / double-submit protection
- [ ] Correct back behavior (iOS swipe, Android back); deep links open
- [ ] Guest behavior verified (browse OK, protected actions gated)
- [ ] Type-safe (TS strict), lint clean

---

## 13. Screen Inventory

Auth: A1 Splash · A2 Onboarding · A3 Welcome · A4 Login · A5 Register · A6 Email Verification · A7 Forgot Password (3) · A8 Complete Profile
Discover: B1 Home · B2 Filter · B3 Location · B4 Listing Detail · B5 Seller Profile · B6 Reviews
Orders: C1 Place Order · C2 Success · D1 List · D2 Detail · E1 Rate
Sell: F1 Gate · F2 Kitchen Name · F3 Form · F4 Preview
Messages: G1 List · G2 Chat
Profile: H1 Home · H2 Edit · H3 My Listings · H4 Password · H5 Language · H6 Notification Settings · H7 Subscription · H8 Blocked · H9 Help · H10 Delete Account
Global: I1 Notifications · I2 Report/Block · I3 Verification Sheet · I4 Login Gate · I5 Shared copy

**Total ≈ 40 screens/sheets.** Old i18n JSON files (`tr/en/nl.json`) can be migrated to the new key structure.