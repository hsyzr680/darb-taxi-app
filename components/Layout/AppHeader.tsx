"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl">
          {t("appName")}
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          >
            <Languages className="h-5 w-5" />
          </Button>
          <Link href="/rider">
            <Button variant={pathname === "/rider" ? "default" : "ghost"}>Rider</Button>
          </Link>
          <Link href="/driver">
            <Button variant={pathname === "/driver" ? "default" : "ghost"}>Driver</Button>
          </Link>
          <Link href="/hub">
            <Button variant="outline">{t("dashboard")}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
