import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { Dashboard } from "@/pages/dashboard";
import { Attivita } from "@/pages/attivita";
import { PolizzePersonali } from "@/pages/polizze-personali";
import { PolizzeAgenzia } from "@/pages/polizze-agenzia";
import { Sinistri } from "@/pages/sinistri";
import { Shell } from "@/components/layout/shell";
import { Login } from "@/pages/login";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Shell>
      <Component />
    </Shell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/attivita" component={() => <ProtectedRoute component={Attivita} />} />
      <Route path="/polizze-personali" component={() => <ProtectedRoute component={PolizzePersonali} />} />
      <Route path="/polizze-agenzia" component={() => <ProtectedRoute component={PolizzeAgenzia} />} />
      <Route path="/sinistri" component={() => <ProtectedRoute component={Sinistri} />} />
      <Route component={() => <ProtectedRoute component={NotFound} />} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
