# llm-docs

A parallel tree that mirrors the repo's source and config files. Each file gets a short markdown doc explaining **why** it exists and what is non-obvious about it, so a future agent or human can orient without reconstructing intent from diffs.

## Naming rule

Doc path = source path with the original extension stripped and `.md` appended.

- `apps/web/src/proxy.ts` -> `llm-docs/apps/web/src/proxy.md`
- `package.json` -> `llm-docs/package.md`
- Filenames starting with a dot are atomic: `.gitignore` -> `llm-docs/.gitignore.md`, `.env.example` -> `llm-docs/.env.example.md`.
- If stripping would collide (`foo.ts` and `foo.js` in one folder), keep the extension: `foo.ts.md`.

## Doc template

`Purpose`, `Key contents`, `Depends on / used by`, `Decisions & caveats` (the most valuable section; never skip it).

## Keep it in sync

Update the matching doc **in the same change** as the source file: edit -> revise the stale parts, create -> add a doc, delete/rename -> remove/move the doc and fix cross-references. A stale doc is worse than none.

## Excluded

- Gitignored files, `node_modules`, build output.
- Lockfiles (`package-lock.json`, `uv.lock`): generated.
- `README.md`, `CHANGELOG.md`, `LICENSE`: self-documenting.
- Binary/media assets.
- `.agents/skills/**`: vendored third-party Clerk/caveman skills installed via the skills CLI (see `skills-lock.json`); not authored here.
