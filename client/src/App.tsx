import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import SignIn from "@/pages/SignIn";
import BirthRegistration from "@/pages/birth-registration";
import DeathRegistration from "@/pages/death-registration";
import VerifyCertificate from "@/pages/verify-certificate";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Home} />
      <Route path="/register/birth" component={BirthRegistration} />
      <Route path="/register/death" component={DeathRegistration} />
      <Route path="/verify" component={VerifyCertificate} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route>{() => <NotFound />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
