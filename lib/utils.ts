import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
}

export function formatDuration(minutes: number, t: (k: string) => string): string {
  if (minutes < 60) return `${Math.round(minutes)} ${t("min")}`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}${t("min")}` : `${h}h`;
}
