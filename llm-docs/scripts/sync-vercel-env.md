# scripts/sync-vercel-env.ts

**Purpose:** Pushes local .env values to a Vercel project's environment via the Vercel CLI.

**Key contents:** Parses args (optional environment: development/preview/production, default preview; env file paths; flags after `--` forwarded to Vercel), loads files with dotenv (default apps/web/.env), warns on localhost/file values, then runs `npx vercel env add <key> <env> --force --yes --non-interactive` per key, feeding the value on stdin.

**Depends on / used by:** Reads apps/web/.env; shells out to vercel. Likely invoked via a root package.json script.

**Decisions & caveats:** Uses `--force`, so it overwrites existing remote values. Warns, but does not block, when values look local. Exits on first failure, leaving earlier keys already synced. A redeploy is needed afterwards. SKIP_KEYS/OVERRIDE_KEYS are empty hooks for customisation.
