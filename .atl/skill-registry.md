# Skill Registry

Generated: 2026-05-11
Project: frontend-project-gym-v2

## Sources Scanned
- User skills: `~/.claude/skills/`, `~/.config/opencode/skills/`, `~/.gemini/skills/`, `~/.cursor/skills/`, `~/.copilot/skills/`, `~/.agents/skills/`
- Project skills: none found under `.claude/skills/`, `.gemini/skills/`, `.agent/skills/`, `skills/`
- Convention files (project): none found in this folder
- Convention context (workspace parent): `C:/Users/PC FS SOLUCIONES/Documents/DEV/plus-fit/CLAUDE.md`

_Exclusions applied: `sdd-*`, `_shared`, `skill-registry`._

## Active Skill Contracts (compact)

### brainstorming
- Trigger before any creative feature/design behavior changes.
- Block implementation until intent and design are clarified.
- Ask one question at a time and stop.
- Validate architecture, data flow, error handling, and tests before coding.
- Prefer explicit tradeoffs over default choices.
Path: `C:/Users/PC FS SOLUCIONES/.agents/skills/brainstorming/SKILL.md`

### systematic-debugging
- No fixes without reliable reproduction and root-cause analysis.
- Inspect recent changes first; instrument boundaries when needed.
- Test one hypothesis at a time with minimal changes.
- If repeated failed fixes happen, challenge architecture assumptions.
- Document evidence for why the fix works.
Path: `C:/Users/PC FS SOLUCIONES/.agents/skills/systematic-debugging/SKILL.md`

### interface-design
- Use for product interfaces (not marketing sites).
- Require explicit user, task, and desired feel before UI implementation.
- Justify hierarchy, spacing, typography, and interaction structure.
- Avoid template-looking defaults; establish domain signature.
- Run quality checks before presenting output.
Path: `C:/Users/PC FS SOLUCIONES/.claude/skills/interface-design/SKILL.md`

### accessibility
- Apply WCAG 2.1 with AA baseline.
- Ensure keyboard operability and visible focus states.
- Use semantic labels and non-color-only meaning.
- Keep text/control contrast compliant.
- Verify compatibility with assistive technology.
Path: `C:/Users/PC FS SOLUCIONES/.agents/skills/accessibility/SKILL.md`

### best-practices
- Enforce HTTPS and avoid mixed content.
- Favor security headers and CSP where feasible.
- Sanitize untrusted input and avoid unsafe HTML injection.
- Keep dependencies audited for vulnerabilities.
- Preserve compatibility essentials (doctype/charset/viewport).
Path: `C:/Users/PC FS SOLUCIONES/.agents/skills/best-practices/SKILL.md`

### performance
- Prioritize highest-impact bottlenecks first.
- Keep critical render path lean and defer non-critical assets.
- Control JS/CSS/image budgets and split by route/feature.
- Optimize media loading and caching/compression strategy.
- Validate gains with measurable outcomes.
Path: `C:/Users/PC FS SOLUCIONES/.agents/skills/performance/SKILL.md`

### work-unit-commits
- Commit by reviewable work unit, not by file type.
- Include tests/docs with the behavior they validate.
- Keep commits rollback-safe and independently understandable.
- Watch PR size and split when review focus is at risk.
- Use conventional commit messages focused on outcome.
Path: `C:/Users/PC FS SOLUCIONES/.config/opencode/skills/work-unit-commits/SKILL.md`

### branch-pr
- PRs require approved issue linkage.
- Use exactly one `type:*` label.
- Follow required branch naming convention.
- Respect PR template sections and test plan.
- Meet policy/CI requirements before merge.
Path: `C:/Users/PC FS SOLUCIONES/.config/opencode/skills/branch-pr/SKILL.md`

### chained-pr
- Split oversized changes into reviewable PR slices.
- Keep each PR independently verifiable.
- Document ordering/dependencies between slices.
- Use one chain strategy consistently.
- Treat base contamination as hygiene issue to fix early.
Path: `C:/Users/PC FS SOLUCIONES/.config/opencode/skills/chained-pr/SKILL.md`

### comment-writer
- Start with the actionable point.
- Keep tone warm, direct, and concise.
- Explain why behind requested changes.
- Avoid low-value nit accumulation.
- Match collaborator language context.
Path: `C:/Users/PC FS SOLUCIONES/.config/opencode/skills/comment-writer/SKILL.md`
