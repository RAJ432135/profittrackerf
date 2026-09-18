# Vehicle Profit Tracker — Mobile (React Native / Expo)

A React Native port of the Vehicle Profit Tracker web app's UI, built with
Expo. It reproduces the "Sky" theme (light blue gradient background, frosted
glass cards, amber accent) and every screen from the web app:

- **Login / Register / Forgot password** — matches `AuthLayout`
- **Home (Dashboard)** — just today's profit + a tappable list of vehicles
- **Vehicle detail** (tap any vehicle, from Home or the Vehicles tab) — profit is
  the biggest number on screen, with period filter (Today / This Month / This
  Year / Custom range), an expense breakdown by category, income listed per
  entry, and a recent-transactions feed — this answers "meri is gadi ne kitna
  kamaya?" without making the owner read a report first
- **Vehicles** — list, add/edit bottom sheet, delete confirmation (tap a row to
  open its detail screen; tap the pencil/trash icons to edit/delete)
- **Add** — vehicle picker, income/expense toggle, category chips, confirm modal
- **Reports** — the deeper multi-vehicle analysis view, for when the owner wants
  more than a single vehicle's numbers
- **History** — period + filters, search, edit/delete across all vehicles
- **Profile** — account info, change password, log out

The flow is: **Home → tap a vehicle → pick a period → see profit.** Reports and
History are still there for when someone wants the full multi-vehicle picture,
but they're no longer the first thing the owner has to parse.

The app is fully free — there is no paywall, subscription, or locked history
anywhere in this build. Every screen (Today, This Month, This Year, All time,
Custom range, and every vehicle's full month-by-month history) is open to
everyone from the moment they sign up.

## Vehicles or shops — same app

A "unit" being tracked can be a vehicle (Truck / Bus / Mini truck / Pickup)
or a shop/branch (Shop / Branch) — a truck owner and a shopkeeper both just
add "units" from the same Vehicles tab, and can have one or several of them.
The type picked changes three things automatically:

- **Icon** — truck/bus icon for vehicles, a store/building icon for shops
  (`src/utils/unitIcons.ts`)
- **Name field label** — "Vehicle number" vs "Shop / branch name"
  (`unitNameLabel()` in `src/types/domain.ts`)
- **Categories offered on Add/Edit** — a vehicle gets Trip/Diesel/Toll/Driver;
  a shop gets Sale/Rent/Stock/Staff/Electricity; both share Maintenance/Food/
  Other (`categoriesForUnitType()` in the same file)

Everything else — Dashboard, Vehicle detail (profit-first view, previous
months, expense/income breakdown), History, Reports — works identically
regardless of which type a given unit is, since they all key off the same
`Vehicle`/`Transaction` records.

The app runs entirely on **local in-memory mock data** (seeded with two
vehicles and a handful of transactions) — there's no backend wired up, since
the goal here is the UI/UX. Swap `src/context/AppDataContext.tsx` for real
API calls (mirroring the web app's `container.*Service` calls) when you're
ready to connect it to the actual backend.

## Run it

```bash
npm install
npm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR
code with the Expo Go app on your phone. `npm run web` also works if you
just want to preview it in a browser.

## Structure

```
App.tsx                     — providers + navigation root
src/
  theme/theme.ts             — colors, gradients, rupee() formatter
  types/domain.ts            — Vehicle/Transaction types + enums
  context/AppDataContext.tsx — in-memory "backend" (auth, vehicles, txns)
  components/                — GlassCard, GhostButton, Button, Input, Alert,
                                AppShell, BackgroundGlow
  navigation/
    RootNavigator.tsx         — auth stack vs. main app stack
    TabNavigator.tsx          — bottom tab bar (Home/Vehicles/Add/Reports/History)
  screens/                    — one file per screen
  utils/dateRanges.ts         — period filtering helpers for History/Reports
```

## Notes on fidelity to the web app

- Colors, spacing, and copy were carried over 1:1 from the web app's
  `index.css` tokens and page components.
- The web app's "glass panel" effect (`backdrop-filter: blur`) is done with
  `expo-blur`'s `BlurView`.
- The web app's centered "phone card" chrome doesn't apply here since the
  app itself already fills a real phone screen — screens use the native
  status bar and a bottom tab bar instead.
- Modal bottom sheets (add/edit vehicle, add/edit transaction, delete
  confirmation) use React Native's built-in `Modal` component.
