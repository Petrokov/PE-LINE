import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hr", "sl", "en"],
  defaultLocale: "hr",
  localePrefix: "always",
});
