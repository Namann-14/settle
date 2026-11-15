// Canonical public origin, used for metadataBase, robots and the sitemap.
// NEXT_PUBLIC_SITE_URL wins; on Vercel production the project domain is the
// fallback so a missing variable never yields localhost canonicals live.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3001";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Settle";
export const SITE_TITLE = "Settle - Split bills, not friendships";
export const SITE_DESCRIPTION =
  "Track shared expenses for trips, flats and dinners. Add expenses in plain words, see who owes whom, and settle up in the fewest payments.";
