import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Home from "@/pages/home";
import Studio from "@/pages/studio";
import Catalog from "@/pages/catalog";
import Quote from "@/pages/quote";
import Account from "@/pages/account";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import TrackPage from "@/pages/track";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminGuard from "@/pages/admin/AdminGuard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminProduction from "@/pages/admin/AdminProduction";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public order tracking */}
      <Route path="/track" component={TrackPage} />

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <AdminGuard><AdminDashboard /></AdminGuard>} />
      <Route path="/admin/orders/:id" component={() => <AdminGuard><AdminOrderDetail /></AdminGuard>} />
      <Route path="/admin/orders" component={() => <AdminGuard><AdminOrders /></AdminGuard>} />
      <Route path="/admin/customers" component={() => <AdminGuard><AdminCustomers /></AdminGuard>} />
      <Route path="/admin/production" component={() => <AdminGuard><AdminProduction /></AdminGuard>} />
      <Route path="/admin/payments" component={() => <AdminGuard><AdminPayments /></AdminGuard>} />
      <Route path="/admin/analytics" component={() => <AdminGuard><AdminAnalytics /></AdminGuard>} />

      {/* Main site */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/studio" component={Studio} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/quote" component={Quote} />
            <Route path="/account" component={Account} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
