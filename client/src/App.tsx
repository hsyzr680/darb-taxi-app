import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/AuthPage";
import RiderDashboard from "@/pages/RiderDashboard";
import DriverDashboard from "@/pages/DriverDashboard";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRole }: { component: React.ComponentType, allowedRole?: "rider" | "driver" }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Redirect if role doesn't match and a specific role was required
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their appropriate dashboard instead of 404
    return user.role === "driver" ? <DriverDashboard /> : <RiderDashboard />;
  }

  return <Component />;
}

function DashboardRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-background" />;
  
  if (!user) return <AuthPage />;

  return user.role === "driver" ? <DriverDashboard /> : <RiderDashboard />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={DashboardRouter} />
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
