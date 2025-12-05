# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling and Commands

This is a React + Vite SPA using React Router, built with plain JavaScript (no TypeScript yet).

### Package management

Use npm by default in this repo.

- Install dependencies:
  - `npm install`

### Core dev commands

Defined in `package.json`:

- Start dev server (HMR):
  - `npm run dev`
- Build for production:
  - `npm run build`
- Lint the project:
  - `npm run lint`
- Preview the production build locally (after `npm run build`):
  - `npm run preview`

### Tests

There is currently **no test script or test framework configured** in `package.json`. If you add one (for example, Vitest or Jest), also update this WARP.md with:

- The command to run the full test suite
- The command to run a single test file or a filtered subset

## High-level Architecture

### Overview

The app is a minimal React SPA scaffolded with Vite. Routing is handled by `react-router-dom`. Styling is centralized in a global CSS file that defines theme tokens (colors, spacing, typography, focus styles) and basic layout.

Key characteristics:

- **Entry + shell** wired through Vite and ReactDOM
- **Client-side routing** via `BrowserRouter`, `Routes`, and `Route`
- **Page-level components** under `src/pages`
- **Design tokens & base styles** defined once in `src/styles/global.css`

Supabase and `lucide-react` are declared as dependencies but are not yet wired up anywhere in the current source files.

### File layout and responsibilities

- `src/main.jsx`
  - React entry point created by Vite.
  - Creates the React root, wraps the app in `<React.StrictMode>` and `BrowserRouter`, and renders `App` into `#root`.
  - Imports `src/styles/global.css` so that global styles apply across the entire app.

- `src/App.jsx`
  - Defines the top-level **application shell**.
  - Renders a wrapper `<div className="app-shell">` and configures React Router:
    - `/` → `HomePage`.
  - This is where you should add new `Route` definitions as the app grows.

- `src/pages/HomePage.jsx`
  - Simple, presentational page component for `/`.
  - Currently renders the product name and a short description ("Mobile-first sustainable fitness tracker MVP.").
  - As new pages are added, they should live alongside this file in `src/pages/` and be wired into `App.jsx` routes.

- `src/styles/global.css`
  - Defines **CSS custom properties** that act as the design system tokens:
    - Colors (`--color-bg`, `--color-surface`, `--color-primary`, `--color-text`, `--color-error`).
    - Spacing scale (`--space-*`).
    - Radii (`--radius-*`).
    - Focus ring style (`--focus-ring`).
  - Sets base styles for `body`, `html`, `#root` and provides the `.app-shell` layout.
  - Implements an accessible focus style via `:focus-visible` using the shared `--focus-ring` token.

### How to extend

When adding features, keep these patterns in mind so future agents can navigate easily:

- **New pages / routes**
  - Create a new component under `src/pages/`, e.g. `src/pages/DashboardPage.jsx`.
  - Import it into `src/App.jsx` and add a corresponding `<Route path="/dashboard" element={<DashboardPage />} />`.

- **Styling and theming**
  - Prefer using or extending the existing CSS variables in `src/styles/global.css` for colors, spacing, and radii.
  - If you introduce additional global tokens, define them alongside the existing ones to keep the design system centralized.

- **Data and APIs**
  - Supabase is available as a dependency (`@supabase/supabase-js`) but not yet configured.
  - When you introduce Supabase usage, consider placing the client initialization in a dedicated module (e.g. `src/lib/supabaseClient.js`) so it can be reused across pages and components.
