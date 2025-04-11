import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductPage from "@/pages/product-page";
import CartPage from "@/pages/cart-page";
import ArExperience from "@/pages/ar-experience";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import { ProtectedRoute } from "./lib/protected-route";
import RTLTransitionWrapper from "@/components/rtl-transition-wrapper";
import { useTranslation } from "react-i18next";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/ar-experience" component={ArExperience} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/products" component={AdminProducts} />
      <ProtectedRoute path="/admin/orders" component={AdminOrders} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <RTLTransitionWrapper>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-family-rtl' : 'font-family-ltr'}>
        <Router />
      </div>
    </RTLTransitionWrapper>
  );
}

export default App;
