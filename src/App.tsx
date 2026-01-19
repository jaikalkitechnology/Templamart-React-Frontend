import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShoppingProvider } from "@/context/ShoppingContext";
import ProtectedRoute from "@/context/ProtectedRoute";
import { AuthProvider } from "@/context/auth-context";

// Layouts
import MainLayout from "@/components/layout/MainLayout";
import SellerLayout from "@/components/seller/SellerLayout";
import AdminLayout from "@/components/admin/AdminLayout";

// Public Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Pricing from "@/pages/Pricing";
import BecomeSeller from "@/pages/BecomeSeller";
import TemplatesPage from "@/pages/templates/TemplatesPage";
import TemplateDetails from "@/pages/templates/TemplateDetails"; 
import CategoryPage from "@/pages/categories/CategoryPage";
import UserAccount from "@/pages/UserAccount";
import NotFound from "@/pages/NotFound";
import Terms from "@/pages/Terms-condition";
import RefundPolicy from "@/pages/RefundPolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import LicenseAgreement from "@/pages/License";
import Contact from "./pages/Contact";
// Seller Pages
import SellerDashboard from "@/pages/seller/SellerDashboard";
import SellerTemplates from "@/pages/seller/SellerTemplates";
import UploadTemplate from "@/pages/seller/UploadTemplate";
import SellerSales from "@/pages/seller/SellerSales";
import SellerAnalytics from "@/pages/seller/SellerAnalytics";
import SellerWallet from "@/pages/seller/SellerWallet";
import SellerSettings from "@/pages/seller/SellerSettings";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import WalletManagement from "@/pages/admin/WalletManagement";
import UsersManagement from "@/pages/admin/UsersManagement";
import SellersManagement from "@/pages/admin/SellersManagement";
import TemplatesManagement from "@/pages/admin/TemplatesManagement";
import CategoriesManagement from "@/pages/admin/CategoriesManagement";
import SalesManagement from "@/pages/admin/SalesManagement";
import AnalyticsManagement from "@/pages/admin/AnalyticsManagement";
import AdminSettings from "@/pages/admin/AdminSettings";


import ScrollToTop from "./components/ScrollToTop"; 
import ScrollToTopButton from '../src/pages/ScrollToTopButton';
//Default Meta
import DefaultMeta from "./DefaultMeta";
import AboutUs from './pages/aboutus';
import SellerKYCPage from './pages/seller/SellerKYCPage';
import EditTemplate from './components/sellerKyc/EditTemplate';
import TxnsManagement from './pages/admin/TxnsManagement';
import ContactSellerManagement from './pages/admin/ContactSeller';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <DefaultMeta />  {/* 🔥 Now this applies meta to all pages by default */}
      <AuthProvider>
        <TooltipProvider>
          <ShoppingProvider>
            <Toaster />
            <Sonner />
            <ScrollToTopButton />
            <ScrollToTop />
            <Routes>
              {/* Main Site Routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/become-seller" element={<BecomeSeller />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/template/:id" element={<TemplateDetails />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/license" element={<LicenseAgreement />} />
                <Route path="account" element={<UserAccount />} />
                <Route path="contact" element={<Contact />} />
                <Route path="aboutus" element={<AboutUs />} />
              </Route>

              {/* Seller Dashboard Routes */}

              <Route
                path="/seller/*"
                element={
                  <ProtectedRoute allowedRoles={[2]}>
                    <SellerLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="templates" element={<SellerTemplates />} />
                <Route path="templates/new" element={<UploadTemplate />} />
                <Route path="sales" element={<SellerSales />} />
                <Route path="analytics" element={<SellerAnalytics />} />
                <Route path="wallet" element={<SellerWallet />} />
                <Route path="kyc" element={<SellerKYCPage />} />
                <Route path="settings" element={<SellerSettings />} />
                <Route path="templates/edit/:product_token" element={<EditTemplate />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={[3]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="sellers" element={<SellersManagement />} />
                <Route path="templates" element={<TemplatesManagement />} />
                <Route path="categories" element={<CategoriesManagement />} />
                <Route path="sales" element={<SalesManagement />} />
                <Route path="analytics" element={<AnalyticsManagement />} />
                <Route path="wallet" element={<WalletManagement />} />
                <Route path="reports" element={< TxnsManagement />} />
                <Route path="contactSellers" element={<ContactSellerManagement />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ShoppingProvider>
        </TooltipProvider>
        
        <ScrollToTop />

      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
