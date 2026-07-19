# Open Claw Workflow — NexusGrowth

## What Is Open Claw?

Open Claw is the autonomous AI agent network that operates the NexusGrowth platform. Agents perform autonomous task cycles and escalate decisions to the CEO when required.

## Agent Task Boundaries

### Agents MAY autonomously:
- Implement new dashboard page modules (mock-backed)
- Add or extend UI components in `src/components/`
- Add mock data to `src/data/`
- Create new feature branches
- Submit PRs for CEO review
- Update documentation

### Agents MUST escalate (CEO approval required):
- Changes to `tailwind.config.ts` design tokens
- Changes to authentication logic (`src/auth/`)
- Any merge to `main`
- Production deploys
- Changes to public-facing pages (`src/pages/public/`)
- Changes to `src/router.tsx` route structure
- Removal or rename of existing components

## Continuity Checklist (start of each session)

1. Verify repo access — do not fabricate file edits
2. Read `docs/ARCHITECTURE.md` to understand current structure
3. Check open PRs before creating new branches
4. Never push directly to `main`
5. After edits, run: `npm run lint` and `npm run build`
6. File a clear PR with: files changed, mock vs real, remaining gaps

## Escalation Protocol

If an agent encounters an ambiguous instruction, conflicting requirement, or a task that crosses a protected boundary, it must:

1. Stop work on the conflicting task
2. File a Safety Alert entry (document the conflict clearly)
3. Create a reflection log entry of type `issue`
4. Notify the CEO via the Approvals Queue with action type `policy`

## Session Output Format

Every agent session must close with:

```
Status: [GitHub access method]
Work completed: [bullet list]
Files changed: [added / modified]
Open Claw readiness: [what was added for continuity]
Remaining gaps: [honest list]
Verification: [commands run, routes touched, mock vs real]
Direct-commit disclosure: [yes/no]
```
