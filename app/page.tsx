import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <h1 className="text-4xl font-bold mb-1">Darb</h1>
      <p className="text-xl text-muted-foreground mb-6" dir="rtl">درب</p>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
        تطبيق تاكسي متكامل
      </p>
      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <Button asChild size="lg" className="h-11">
          <Link href="/auth">تسجيل الدخول</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11">
          <Link href="/auth/signup">إنشاء حساب جديد</Link>
        </Button>
        <div className="flex gap-4 justify-center pt-2">
          <Link href="/rider" className="text-xs text-muted-foreground hover:text-foreground">
            راكب
          </Link>
          <Link href="/driver" className="text-xs text-muted-foreground hover:text-foreground">
            سائق
          </Link>
          <Link href="/hub" className="text-xs text-muted-foreground hover:text-foreground">
            لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
