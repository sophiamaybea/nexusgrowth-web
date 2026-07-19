# NexusGrowth Web

Public-facing website + internal CEO command-bridge dashboard for NexusGrowth.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6

## Getting Started

```bash
npm install
npm run dev
```

## Structure

- `/` — Public website (Home, Services, Industries, Case Studies, Pricing, About, Contact)
- `/dashboard/*` — Internal CEO dashboard (Mission Control, Departments, Finance, Activity, Approvals, Alerts, Reports, Chat, Reflection)

## Branch Model

- `main` — protected, production only, CEO approval required
- `staging` — integration branch
- `feature/*` — per-initiative or per-department feature branches (agent-writable)
- `sync-upstream/*` — Open Claw upstream sync branches

## Access

Open Claw agents operate on feature branches only. All merges to `main` require CEO approval via pull request review. No direct push to `main` is permitted.

## Secrets

Never commit secrets to this repo. Use `.env.local` locally and GitHub Actions Secrets / environment variables in production.
