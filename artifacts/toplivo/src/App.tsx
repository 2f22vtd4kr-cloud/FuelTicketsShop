import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import MapPage from "@/pages/map";
import CatalogPage from "@/pages/catalog";
import AnalyticsPage from "@/pages/analytics";
import VaultPage from "@/pages/vault";
import AdminPage from "@/pages/admin";

import { UserProvider } from "@/lib/context/user";
import { AppLayout } from "@/components/layout/app-layout";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={MapPage} />
        <Route path="/catalog" component={CatalogPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/vault" component={VaultPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
