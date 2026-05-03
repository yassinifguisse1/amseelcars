import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import(`../../messages/${locale}.json`)).default;
  const carProducts = (await import(`../../messages/car-products.${locale}.json`))
    .default;
  const destinationLandings = (
    await import(`../../messages/destination-landings.${locale}.json`)
  ).default;

  return {
    locale,
    messages: { ...base, carProducts, ...destinationLandings },
    timeZone: "Africa/Casablanca",
  };
});
