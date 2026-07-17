/**
 * Locale-scoped UI: `NextIntlClientProvider` + static locale params.
 * `<html lang="…">` lives in `app/layout.tsx` and follows the
 * `x-next-intl-locale` request header set by `next-intl` middleware.
 */
import { Suspense } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { SiteTracker } from "@/components/analytics/SiteTracker";
import { PublicStatsigProvider } from "@/components/analytics/PublicStatsigProvider";
import { ArticleLocalePathsProvider } from "@/contexts/ArticleLocalePathsContext";
import { getStatsigClientKey, isStatsigConfigured } from "@/lib/statsig/config";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const statsigClientKey = isStatsigConfigured() ? getStatsigClientKey() : null;

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <ArticleLocalePathsProvider>
        <PublicStatsigProvider clientKey={statsigClientKey}>
          <Suspense fallback={null}>
            <SiteTracker />
          </Suspense>
          <Header />
          <main id="main-content">{children}</main>
        </PublicStatsigProvider>
      </ArticleLocalePathsProvider>
    </NextIntlClientProvider>
  );
}
