"use client";

import { useCallback, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { resolveCarDetailSlugForLocale } from "@/lib/carSlugLocale";
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

interface HeaderLocaleSelectProps {
  closeMenu?: () => void;
}

function FlagWrap({ children }: { children: ReactNode }) {
  return (
    <span
      className="flex h-[22px] w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      {children}
    </span>
  );
}

/**
 * Language switcher next to MENU: shadcn DropdownMenu + flags + Playfair label.
 * Default locale remains `fr` via `routing.defaultLocale`.
 */
export function HeaderLocaleSelect({ closeMenu }: HeaderLocaleSelectProps) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const params = routeParamsWithoutLocale(useParams());
  const router = useRouter();

  const active = LOCALE_ENTRIES.find((e) => e.code === locale) ?? LOCALE_ENTRIES[0];
  const ActiveFlag = active.Flag;

  const applyLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale) return;

      const slug = params.slug;
      const carSlug = params.carSlug;
      const brandSlugParam = params.brandSlug;
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
      if (onCarBrandDetail) {
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
      router.replace(target);
      closeMenu?.();
    },
    [locale, pathname, params, router, closeMenu],
  );

  return (
    <div className="relative shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-[50px] min-w-[7.5rem] items-center justify-center gap-2 rounded-full border-0 px-3 pr-3.5 outline-none",
              "bg-gradient-to-br from-white to-neutral-100 text-neutral-950 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_2px_12px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]",
              "font-[family-name:var(--font-heading)] text-[0.8125rem] font-semibold tracking-[0.04em]",
              "transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_16px_rgba(0,0,0,0.1),0_12px_32px_rgba(236,28,37,0.12)]",
              "focus-visible:shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_0_0_3px_rgba(236,28,37,0.35),0_4px_20px_rgba(0,0,0,0.1)]",
              "data-[state=open]:translate-y-0 data-[state=open]:shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_2px_8px_rgba(0,0,0,0.06)]",
              "data-[state=open]:[&_.locale-chevron]:rotate-180 data-[state=open]:[&_.locale-chevron]:opacity-85",
              "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:p-px before:content-['']",
              "before:bg-gradient-to-br before:from-white/95 before:to-black/10 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:[-webkit-mask-composite:xor]",
            )}
            aria-label={t("languageSelectAria")}
          >
            <span className="relative z-[1] inline-flex items-center gap-2">
              <FlagWrap>
                <ActiveFlag />
              </FlagWrap>
              <span className="whitespace-nowrap max-[380px]:text-xs">
                {t(active.labelKey)}
              </span>
              <ChevronDown
                className="locale-chevron size-4 shrink-0 opacity-55 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
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
