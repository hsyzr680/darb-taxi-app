import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-2">Darb</h1>
      <p className="text-2xl md:text-3xl text-muted-foreground mb-8" dir="rtl">
        درب
      </p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Premium taxi ecosystem with real-time chat, advanced ride logic, and
        analytics.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/auth">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/auth?role=rider">Book as Rider</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/auth?role=driver">Drive with Darb</Link>
        </Button>
      </div>
      <div className="mt-12 flex gap-6">
        <Link href="/hub" className="text-sm text-muted-foreground hover:text-foreground">
          Admin Hub
        </Link>
      </div>
    </div>
  );
}
