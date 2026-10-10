# turbo.json

**Purpose:** Turborepo task pipeline.

**Key contents:** Defines `build` (depends on upstream builds, caches dist and .next outputs, keys on `.env*`), `lint`, `check-types`, and a persistent non-cached `dev` task; TUI mode.

**Depends on / used by:** Used by root scripts; each workspace package supplies the scripts (see `services/api/package.json`).

**Decisions & caveats:** `.env*` files are cache inputs, so changing env files invalidates build cache. `.next/cache` is excluded from outputs.
