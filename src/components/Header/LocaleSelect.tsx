"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { trackEvent } from "@/lib/trackEvent";
import { cn } from "@/lib/utils";
import { resolveCarDetailSlugForLocale } from "@/lib/carSlugLocale";
import { useArticleLocalePaths } from "@/contexts/ArticleLocalePathsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlagDe, FlagEs, FlagFr, FlagGb, FlagPl } from "./LocaleFlagIcons";

type AppLocale = (typeof routing.locales)[number];

const LOCALE_ENTRIES: {
  code: AppLocale;
  Flag: typeof FlagFr;
  labelKey: "langFr" | "langEn" | "langEs" | "langDe" | "langPl";
}[] = [
  { code: "fr", Flag: FlagFr, labelKey: "langFr" },
  { code: "en", Flag: FlagGb, labelKey: "langEn" },
  { code: "es", Flag: FlagEs, labelKey: "langEs" },
  { code: "de", Flag: FlagDe, labelKey: "langDe" },
  { code: "pl", Flag: FlagPl, labelKey: "langPl" },
];

function routeParamsWithoutLocale(
  raw: ReturnType<typeof useParams>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "locale" || value === undefined) continue;
    out[key] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  return out;
}

function bypassCachedArticleRedirect(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}_localeSwitch=v2`;
}

interface HeaderLocaleSelectProps {
  closeMenu?: () => void;
  /** `header` = red pill next to MENU; `panel` = light style for inside menus */
  variant?: "header" | "panel";
}

function FlagWrap({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-[5px] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.12)]",
        compact ? "h-[18px] w-6" : "h-[22px] w-7",
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

/**
 * Language switcher next to MENU: shadcn DropdownMenu + flags.
 * Default locale remains `fr` via `routing.defaultLocale`.
 */
export function HeaderLocaleSelect({
  closeMenu,
  variant = "panel",
}: HeaderLocaleSelectProps) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const params = routeParamsWithoutLocale(useParams());
  const router = useRouter();
  const articleLocalePaths = useArticleLocalePaths();
  const [switchingLocale, setSwitchingLocale] = useState(false);

  const active = LOCALE_ENTRIES.find((e) => e.code === locale) ?? LOCALE_ENTRIES[0];
  const ActiveFlag = active.Flag;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("_localeSwitch")) return;
    url.searchParams.delete("_localeSwitch");
    window.history.replaceState(window.history.state, "", url);
  }, [locale, pathname]);

  const applyLocale = useCallback(
    async (next: AppLocale) => {
      if (next === locale || switchingLocale) return;

      const slug = params.slug;
      const category = params.category;
      const carSlug = params.carSlug;
      const brandSlugParam = params.brandSlug;
      const onBlogArticle =
        typeof slug === "string" &&
        slug.length > 0 &&
        typeof category === "string" &&
        category.length > 0 &&
        pathname.startsWith("/blog/");
      const onCarBrandDetail =
        typeof carSlug === "string" &&
        carSlug.length > 0 &&
        typeof brandSlugParam === "string" &&
        brandSlugParam.length > 0 &&
        (pathname.includes("/brand/") || pathname.includes("/marque/"));
      const onCarDetailFlat =
        typeof slug === "string" &&
        slug.length > 0 &&
        (pathname.startsWith("/cars/") || pathname.startsWith("/voitures/")) &&
        !onCarBrandDetail;

      let target: string;
      if (onBlogArticle) {
        const cachedPath = articleLocalePaths?.[next];
        if (cachedPath) {
          target = cachedPath;
        } else {
          setSwitchingLocale(true);
          const query = new URLSearchParams({
            category,
            slug,
            sourceLocale: locale,
            targetLocale: next,
          });
          try {
            const response = await fetch(`/api/articles/translation-path?${query}`, {
              cache: "no-store",
            });
            const data = response.ok
              ? (await response.json()) as { path?: string }
              : null;
            target = data?.path || getPathname({ href: "/blog", locale: next });
          } catch {
            target = getPathname({ href: "/blog", locale: next });
          } finally {
            setSwitchingLocale(false);
          }
        }
      } else if (onCarBrandDetail) {
        const nextCarSlug = resolveCarDetailSlugForLocale(carSlug, next);
        target = getPathname({
          href: {
            pathname: "/cars/brand/[brandSlug]/[carSlug]",
            params: { brandSlug: brandSlugParam, carSlug: nextCarSlug },
          },
          locale: next,
        });
      } else if (onCarDetailFlat) {
        const nextSlug = resolveCarDetailSlugForLocale(slug, next);
        target = getPathname({
          href: { pathname: "/cars/[slug]", params: { slug: nextSlug } },
          locale: next,
        });
      } else {
        const hasDynamicSegment = String(pathname).includes("[");
        const href = hasDynamicSegment
          ? { pathname, params }
          : pathname;
        target = getPathname({
          href: href as Parameters<typeof getPathname>[0]["href"],
          locale: next,
        });
      }

      // Keep next-intl cookie in sync (see next-intl #786) without using
      // useRouter from @/i18n/navigation — that wrapper forces a /{locale}/…
      // prefix even when localePrefix is "never", which breaks some navigations.
      document.cookie = `NEXT_LOCALE=${next};path=/;SameSite=lax;max-age=31536000`;
      trackEvent({
        event: 'locale-change',
        path: pathname,
        source: 'header',
        ctaLabel: `${locale} → ${next}`,
        metadata: { from: locale, to: next },
      });
      router.replace(onBlogArticle ? bypassCachedArticleRedirect(target) : target);
      closeMenu?.();
    },
    [locale, pathname, params, router, closeMenu, articleLocalePaths, switchingLocale],
  );

  const isHeader = variant === "header";

  return (
    <div className={cn("relative shrink-0", isHeader && "z-[2]")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 border-0 outline-none",
              "font-[family-name:var(--font-heading)] font-bold uppercase tracking-[0.04em]",
              "transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]",
              "data-[state=open]:[&_.locale-chevron]:rotate-180",
              isHeader
                ? cn(
                    "h-[50px] min-w-[50px] rounded-[25px] bg-[#a8142f] px-3 text-white",
                    "hover:bg-[#EC1C25] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    "max-[480px]:h-[42px] max-[480px]:min-w-[42px] max-[480px]:px-2.5",
                  )
                : cn(
                    "h-[50px] min-w-[7.5rem] rounded-full bg-gradient-to-br from-white to-neutral-100 px-3 pr-3.5 text-neutral-950",
                    "shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_2px_12px_rgba(0,0,0,0.08)]",
                    "hover:-translate-y-px focus-visible:shadow-[0_0_0_3px_rgba(236,28,37,0.35)]",
                  ),
            )}
            aria-label={t("languageSelectAria")}
            aria-busy={switchingLocale}
            disabled={switchingLocale}
          >
            <span className="relative z-[1] inline-flex items-center gap-1.5">
              <FlagWrap compact={isHeader}>
                {switchingLocale ? (
                  <Loader2
                    className={cn(
                      "size-3.5 animate-spin",
                      isHeader ? "text-white" : "text-neutral-600",
                    )}
                    aria-hidden
                  />
                ) : (
                  <ActiveFlag />
                )}
              </FlagWrap>
              {!isHeader && (
                <span className="whitespace-nowrap text-[0.8125rem] max-[380px]:text-xs">
                  {t(active.labelKey)}
                </span>
              )}
              {isHeader && (
                <span className="text-[0.7rem] text-white max-[380px]:hidden sm:text-[0.75rem]">
                  {active.code.toUpperCase()}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "locale-chevron shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  isHeader
                    ? "size-3.5 text-white/85"
                    : "size-4 opacity-55 text-neutral-800",
                )}
                strokeWidth={2.25}
                aria-hidden
              />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="z-[1102] min-w-[12.5rem] rounded-2xl border border-white/65 bg-white/90 p-2 shadow-xl backdrop-blur-xl backdrop-saturate-[1.35]"
        >
          {LOCALE_ENTRIES.map((entry) => {
            const Flag = entry.Flag;
            const selected = entry.code === locale;
            return (
              <DropdownMenuItem
                key={entry.code}
                className={cn(
                  "cursor-pointer gap-2.5 rounded-xl py-3 pl-2.5 pr-2 font-[family-name:var(--font-heading)] text-sm font-semibold tracking-wide",
                  "focus:bg-[rgba(236,28,37,0.1)] data-[highlighted]:bg-[rgba(236,28,37,0.1)]",
                  selected && "bg-[rgba(236,28,37,0.12)]",
                )}
                onSelect={() => applyLocale(entry.code)}
              >
                <FlagWrap>
                  <Flag />
                </FlagWrap>
                <span className="flex-1">{t(entry.labelKey)}</span>
                <span className="flex size-4 shrink-0 items-center justify-center text-[#ec1c25]">
                  {selected ? (
                    <Check className="size-4" strokeWidth={2.5} aria-hidden />
                  ) : null}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
