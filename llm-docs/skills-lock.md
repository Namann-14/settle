# skills-lock.json

**Purpose:** Lockfile pinning installed agent skills.

**Key contents:** Maps skill names (caveman, many Clerk skills, frontend-design, ui-ux-pro-max, vercel skills, web-design-guidelines) to GitHub source, path and content hash.

**Depends on / used by:** Maintained by the skills tooling; skills are used by Claude Code in `.claude/` / `.agents/`.

**Decisions & caveats:** Generated file; do not edit by hand. The hash detects upstream changes to a skill.
