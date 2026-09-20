import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Team from "../pages/Team";

// =====================================================
// BUSINESS
// =====================================================

import MyBusiness from "../pages/MyBusiness";
import CreateBusiness from "../pages/CreateBusiness";

// =====================================================
// PRODUCTS
// =====================================================

import Products from "../pages/dashboard/Products";
import AddProduct from "../pages/AddProduct";
import EditProduct from "../pages/EditProduct";

// =====================================================
// DASHBOARD
// =====================================================

import Dashboard from "../pages/dashboard/Dashboard";
import Inventory from "../pages/dashboard/Inventory";
import Customers from "../pages/dashboard/Customers";
import Orders from "../pages/dashboard/Orders";
import Invoices from "../pages/dashboard/Invoices";
import Receipts from "../pages/dashboard/Receipts";
import Quotes from "../pages/dashboard/Quotes";
import Suppliers from "../pages/dashboard/Suppliers";

// =====================================================
// FINANCE
// =====================================================

import Expenses from "../pages/dashboard/Expenses";
import Accounting from "../pages/dashboard/Accounting";
import Finance from "../pages/dashboard/Finance";
import Billing from "../pages/Billing";

// =====================================================
// ANALYTICS
// =====================================================

import Reports from "../pages/dashboard/Reports";
import AdvancedReports from "../pages/reports/AdvancedReports";
import Analytics from "../pages/dashboard/Analytics";
import Forecast from "../pages/dashboard/Forecast";
import BusinessHealth from "../pages/dashboard/BusinessHealth";
import HealthScore from "../pages/dashboard/HealthScore";

// =====================================================
// AI
// =====================================================

import AIAssistant from "../pages/dashboard/AIAssistant";

// =====================================================
// OTHER
// =====================================================

import Settings from "../pages/dashboard/Settings";
import Profile from "../pages/Profile";
import Notifications from "../pages/dashboard/Notifications";

import Documents from "../pages/dashboard/Documents";
import DocumentsUpload from "../pages/dashboard/DocumentsUpload";

// =====================================================
// ADVANCED
// =====================================================

import AdvancedDashboard from "../pages/dashboard/AdvancedDashboard";

// =====================================================
// PROTECTION
// =====================================================

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminPage from "../pages/AdminPage";

// =====================================================
// OTHER DASHBOARDS
// =====================================================

import RevenueOverview from "../components/RevenueOverview";
import FinanceDashboard from "../pages/FinanceDashboard";

// =====================================================
// MARKETPLACE
// =====================================================

import Marketplace from "../pages/Marketplace/Marketplace";
import MarketplaceListing from "../pages/Marketplace/MarketplaceListing";
import MarketplaceProductDetails from "../pages/Marketplace/MarketplaceProductDetails";
import MarketplaceSellerProfile from "../pages/Marketplace/MarketplaceSellerProfile";

import CreateListing from "../pages/marketplace/CreateListing";
import MyListings from "../pages/marketplace/MyListings";
import EditListing from "../pages/marketplace/EditListing";

// =====================================================
// ROUTER
// =====================================================

function Router() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/team"
          element={<Team />}
        />

        {/* =================================================
            MARKETPLACE
        ================================================= */}

        {/* Marketplace Home */}

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />

        {/* Create Marketplace Listing */}

        <Route
          path="/marketplace/create"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />

        {/* My Listings */}

        <Route
          path="/marketplace/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            EDIT LISTING
            TEMPORARILY WITHOUT ProtectedRoute
        ================================================= */}

        <Route
          path="/marketplace/edit/:id"
          element={<EditListing />}
        />

        {/* Marketplace Seller Profile */}

        <Route
          path="/marketplace/seller/:id"
          element={
            <ProtectedRoute>
              <MarketplaceSellerProfile />
            </ProtectedRoute>
          }
        />

        {/* Marketplace Product Details */}

        <Route
          path="/marketplace/product/:id"
          element={
            <ProtectedRoute>
              <MarketplaceProductDetails />
            </ProtectedRoute>
          }
        />

        {/* Marketplace Listing */}

        <Route
          path="/marketplace/listing/:id"
          element={
            <ProtectedRoute>
              <MarketplaceListing />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FINANCE DASHBOARD
        ================================================= */}

        <Route
          path="/finance-dashboard"
          element={
            <ProtectedRoute>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REVENUE OVERVIEW
        ================================================= */}

        <Route
          path="/revenue-overview"
          element={
            <ProtectedRoute>
              <RevenueOverview />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            BUSINESS
        ================================================= */}

        <Route
          path="/my-business"
          element={
            <ProtectedRoute>
              <MyBusiness />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-business"
          element={
            <ProtectedRoute>
              <CreateBusiness />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            MAIN DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            INVENTORY
        ================================================= */}

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CUSTOMERS
        ================================================= */}

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ORDERS
        ================================================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SALES
        ================================================= */}

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <Quotes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <Receipts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FINANCE
        ================================================= */}

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounting"
          element={
            <ProtectedRoute>
              <Accounting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REPORTS
        ================================================= */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advancedreports"
          element={
            <ProtectedRoute>
              <AdvancedReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            BUSINESS INTELLIGENCE
        ================================================= */}

        <Route
          path="/forecast"
          element={
            <ProtectedRoute>
              <Forecast />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health"
          element={
            <ProtectedRoute>
              <HealthScore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business-health"
          element={
            <ProtectedRoute>
              <BusinessHealth />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            AI
        ================================================= */}

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/upload"
          element={
            <ProtectedRoute>
              <DocumentsUpload />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADVANCED DASHBOARD
        ================================================= */}

        <Route
          path="/advanceddashboard"
          element={
            <ProtectedRoute>
              <AdvancedDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={<Landing />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default Router;