import { Switch, Route, Router as WouterRouter } from "wouter";
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

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/attivita" component={Attivita} />
        <Route path="/polizze-personali" component={PolizzePersonali} />
        <Route path="/polizze-agenzia" component={PolizzeAgenzia} />
        <Route path="/sinistri" component={Sinistri} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
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
