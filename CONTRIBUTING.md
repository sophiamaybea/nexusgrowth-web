# Contributing to NexusGrowth Web

## Overview

This repository is the CEO command platform for **NexusGrowth**, built on React + Vite + TypeScript + Tailwind CSS. It is maintained under the **Open Claw** autonomous agent workflow with CEO oversight and gated production deploys.

## Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 18 + TypeScript             |
| Build       | Vite 5                            |
| Routing     | React Router v6 (createBrowserRouter) |
| Styling     | Tailwind CSS v3 (custom theme)    |
| Icons       | Lucide React                      |
| Auth        | Scaffolded-only (mock session)    |
| Backend     | None yet                          |

## Getting Started

```bash
npm install
npm run dev        # local dev server
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run preview    # preview production build
```

## Branch Workflow

- `main` is **protected**. No direct pushes.
- All work happens on `feature/<topic>` branches.
- PRs require CEO approval before merge.
- Production deploys are gated — never deploy from a feature branch.

## Open Claw Agents

See [`docs/OPENCLAW_WORKFLOW.md`](docs/OPENCLAW_WORKFLOW.md) for the agent workflow, task boundaries, and escalation rules.

## What Not to Touch

- `tailwind.config.ts` — custom NexusGrowth design tokens. Do not replace with a generic admin theme.
- `src/styles/globals.css` — shared component primitives. Additive edits only.
- `src/auth/AuthContext.tsx` — mock auth scaffold. Real backend integration goes here when ready.
- Public site pages (`src/pages/public/`) — brand-critical. Only touch with CEO sign-off.
