import { routing } from "./routing";
import type { AppLocale } from "./routing";

/**
 * Turn a pathname template (with [param] segments) into a regex, aligned with
 * next-intl’s template matching so we can infer locale from the visible URL.
 */
function templateToRegex(template: string): RegExp {
  const normalizedTemplate = template.endsWith("/") && template !== "/"
    ? template.slice(0, -1)
    : template;
  const regexPattern = normalizedTemplate
    .replace(/\/\[\[(\.\.\.[^\]]+)\]\]/g, "(?:/(.*))?")
    .replace(/\[\[(\.\.\.[^\]]+)\]\]/g, "(?:/(.*))?")
    .replace(/\[(\.\.\.[^\]]+)\]/g, "(.+)")
    .replace(/\[([^\]]+)\]/g, "([^/]+)")
    .replace(/\//g, "\\/");
  return new RegExp(`^${regexPattern}$`);
}

function normalizePathname(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

/**
 * When `localePrefix` is `never`, next-intl’s middleware first resolves locale
 * via prefix/cookie/headers. With `localeDetection: false`, it never reads the
 * cookie, so it defaults to `fr` — then `/about` is wrongly treated as French
 * and redirected to `/a-propos`. For URLs that map to a single locale in
 * `routing.pathnames`, return that locale so middleware can serve the correct
 * language. For shared paths (`/contact`, `/blog/...`), return `null` and let
 * cookie / default decide.
 */
export function inferLocaleFromPathname(pathname: string): AppLocale | null {
  const decoded = normalizePathname(pathname);
  const pathnames = routing.pathnames as Record<
    string,
    string | Record<string, string>
  >;

  for (const [, config] of Object.entries(pathnames)) {
    if (typeof config === "string") {
      continue;
    }
    if (!config || typeof config !== "object") continue;

    const entries = Object.entries(config as Record<string, string>);
    const localizedPaths = [...new Set(entries.map(([, p]) => p))];
    if (localizedPaths.length < 2) {
      continue;
    }

    for (const [locale, localizedPath] of entries) {
      if (!localizedPath.includes("[")) {
        const n = decoded.endsWith("/") && decoded !== "/" ? decoded.slice(0, -1) : decoded;
        const p =
          localizedPath.endsWith("/") && localizedPath !== "/"
            ? localizedPath.slice(0, -1)
            : localizedPath;
        if (n === p) {
          return locale as AppLocale;
        }
      } else if (templateToRegex(localizedPath).test(decoded)) {
        return locale as AppLocale;
      }
    }
  }

  return null;
}
