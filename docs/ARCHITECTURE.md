# Architecture — NexusGrowth Web

## Tech Stack

- **React 18** + **TypeScript** — component model
- **Vite 5** — build tooling
- **React Router v6** (`createBrowserRouter`) — routing
- **Tailwind CSS v3** — styling via custom `nexus-*` design tokens
- **Lucide React** — icon library

## Route Structure

### Public Routes (no auth required)

| Path            | Component                        |
|-----------------|----------------------------------|
| `/`             | `pages/public/HomePage`          |
| `/services`     | `pages/public/ServicesPage`      |
| `/industries`   | `pages/public/IndustriesPage`    |
| `/case-studies` | `pages/public/CaseStudiesPage`   |
| `/pricing`      | `pages/public/PricingPage`       |
| `/about`        | `pages/public/AboutPage`         |
| `/contact`      | `pages/public/ContactPage`       |
| `/sign-in`      | `pages/auth/SignInPage`          |

### Protected Routes (require mock auth session)

| Path                        | Component                              |
|-----------------------------|----------------------------------------|
| `/dashboard`                | `pages/dashboard/MissionControlPage`  |
| `/dashboard/performance`    | `pages/dashboard/DeptPerformancePage` |
| `/dashboard/finance`        | `pages/dashboard/FinancePage`         |
| `/dashboard/activity`       | `pages/dashboard/ActivityFeedPage`    |
| `/dashboard/approvals`      | `pages/dashboard/ApprovalsPage`       |
| `/dashboard/safety`         | `pages/dashboard/SafetyAlertsPage`    |
| `/dashboard/reports`        | `pages/dashboard/ReportsPage`         |
| `/dashboard/chat`           | `pages/dashboard/ChatPage`            |
| `/dashboard/reflection`     | `pages/dashboard/ReflectionPage`      |

## Auth Architecture (Scaffolded — No Backend)

- `src/auth/AuthContext.tsx` — `AuthProvider`, `useAuth` hook, mock session in `sessionStorage`
- `src/auth/ProtectedRoute.tsx` — redirects unauthenticated users to `/sign-in`
- `src/pages/auth/SignInPage.tsx` — sign-in form with mock credential check
- **DEMO credentials**: `ceo@nexusgrowth.io` / `nexus2025`
- **Real backend hook point**: Replace `signIn()` body in `AuthContext.tsx` with real API call

## Component Boundaries

### Reusable Dashboard Primitives (`src/components/ui/`)

| Component   | Purpose                                          |
|-------------|--------------------------------------------------|
| `Panel`     | Glass-panel container with optional header       |
| `KpiCard`   | Single KPI metric with trend indicator           |
| `Badge`     | Inline status/category label (warning/info/muted)|

### Dashboard Feature Components (`src/components/dashboard/`)

Currently unused — reserved for extracted sub-components as pages grow.

## Design System

All design tokens live in `tailwind.config.ts` under the `nexus` namespace:

- **Colours**: `nexus-black`, `nexus-deep`, `nexus-panel`, `nexus-surface`, `nexus-border`, `nexus-muted`
- **Text**: `nexus-text`, `nexus-textMuted`
- **Accent**: `nexus-accent`, `nexus-accentLt`
- **Status**: `nexus-success`, `nexus-warning`, `nexus-danger`
- **Gold**: `nexus-gold`, `nexus-goldLt`

Component primitives are in `src/styles/globals.css`:
- `.glass-panel` — glass/frosted panel treatment
- `.kpi-card` — KPI metric card
- `.status-dot` — coloured status indicator
- `.btn-primary`, `.btn-ghost`, `.btn-gold` — button variants

## Mock vs Real

| Area            | Status                                              |
|-----------------|-----------------------------------------------------|
| Auth            | Mock session (sessionStorage). No backend.          |
| Dashboard data  | All mock — plausible sample values, no API calls    |
| Chat messages   | Local state only — no WebSocket or API              |
| Finance figures | Mock numbers clearly labelled in UI                 |
| Public site     | Static content — no backend                        |

## Where Backend Integrations Connect

1. **Auth**: `src/auth/AuthContext.tsx` → replace `signIn()` mock with real API
2. **Dashboard data**: Each page fetches from a `useQuery()` hook or SWR — add when API is ready
3. **Chat**: `ChatPage.tsx` → replace local state with WebSocket or polling
4. **Reports**: `ReportsPage.tsx` → replace `REPORTS` array with API fetch

## What Must Not Be Casually Edited

- `tailwind.config.ts` — all colour tokens; changes break the entire UI
- `src/styles/globals.css` — shared primitives used across every page
- `src/router.tsx` — route structure; changes affect ProtectedRoute logic
- `src/auth/AuthContext.tsx` — session logic; must be stable until real backend lands
