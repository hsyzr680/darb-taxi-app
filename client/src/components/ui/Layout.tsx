import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, Car, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function Layout({ children, fullWidth = false }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-50">
        <div className="font-display font-bold text-xl tracking-tight text-white">
          Taxi<span className="text-primary">App</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout.mutate()}>
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6 gap-6 z-50">
        <div className="font-display font-bold text-2xl tracking-tight text-white mb-4">
          Taxi<span className="text-primary">App</span>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <Link href="/">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${location === "/" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
              <MapPin className="h-5 w-5" />
              <span>Dashboard</span>
            </div>
          </Link>
          
          <Link href="/profile">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${location === "/profile" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
              <User className="h-5 w-5" />
              <span>Profile</span>
            </div>
          </Link>
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10"
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 relative ${fullWidth ? 'p-0' : 'p-4 md:p-8'} overflow-hidden h-[calc(100vh-65px)] md:h-screen`}>
        {children}
      </main>
    </div>
  );
}
