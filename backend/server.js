const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const ensureAdmin = require("./utils/ensureAdmin");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// STATIC UPLOAD FILES
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// LOAD ROUTES
// =====================================================

const authRoutes =
  require("./routes/authRoutes");

const profileRoutes =
  require("./routes/profileRoutes");

const businessRoutes =
  require("./routes/businessRoutes");

const productRoutes =
  require("./routes/productRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const inventoryRoutes =
  require("./routes/inventoryRoutes");

const customerRoutes =
  require("./routes/customerRoutes");

const receiptRoutes =
  require("./routes/receiptRoutes");

const invoiceRoutes =
  require("./routes/invoiceRoutes");

const expenseRoutes =
  require("./routes/expenseRoutes");

const reportRoutes =
  require("./routes/reportRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");

const forecastRoutes =
  require("./routes/forecastRoutes");

const healthRoutes =
  require("./routes/healthRoutes");

const aiRoutes =
  require("./routes/aiRoutes");

const subscriptionRoutes =
  require("./routes/subscriptionRoutes");

const quoteRoutes =
  require("./routes/quoteRoutes");

const teamRoutes =
  require("./routes/teamRoutes");

const businessMemberRoutes =
  require("./routes/businessMemberRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

const advancedReportsRoutes =
  require("./routes/advancedReportsRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const settingsRoutes =
  require("./routes/settingsRoutes");

const financeRoutes =
  require("./routes/financeRoutes");

const documentRoutes =
  require("./routes/documentRoutes");

const supplierRoutes =
  require("./routes/supplierRoutes");

const globalSearchRoutes =
  require("./routes/globalSearchRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

// =====================================================
// MARKETPLACE ROUTES
// =====================================================

const marketplaceRoutes =
  require("./routes/marketplaceRoutes");

const marketplaceProductRoutes =
  require("./routes/marketplaceProductRoutes");

// =====================================================
// NEW BUSINESS LOGIC ENGINES
// =====================================================

const accountingRoutes =
  require("./routes/accountingRoutes");

const analyticsRoutes =
  require("./routes/analyticsRoutes");

const businessInsightsRoutes =
  require("./routes/businessInsightsRoutes");

const billingRoutes =
  require("./routes/billingRoutes");

// =====================================================
// CHECK ROUTES
// =====================================================

console.log(
  "===================================="
);

console.log(
  "CHECKING BUSYBIZ ROUTES"
);

console.log(
  "===================================="
);

console.log(
  "authRoutes:",
  typeof authRoutes
);

console.log(
  "profileRoutes:",
  typeof profileRoutes
);

console.log(
  "businessRoutes:",
  typeof businessRoutes
);

console.log(
  "productRoutes:",
  typeof productRoutes
);

console.log(
  "orderRoutes:",
  typeof orderRoutes
);

console.log(
  "inventoryRoutes:",
  typeof inventoryRoutes
);

console.log(
  "customerRoutes:",
  typeof customerRoutes
);

console.log(
  "receiptRoutes:",
  typeof receiptRoutes
);

console.log(
  "invoiceRoutes:",
  typeof invoiceRoutes
);

console.log(
  "expenseRoutes:",
  typeof expenseRoutes
);

console.log(
  "reportRoutes:",
  typeof reportRoutes
);

console.log(
  "dashboardRoutes:",
  typeof dashboardRoutes
);

console.log(
  "forecastRoutes:",
  typeof forecastRoutes
);

console.log(
  "healthRoutes:",
  typeof healthRoutes
);

console.log(
  "aiRoutes:",
  typeof aiRoutes
);

console.log(
  "subscriptionRoutes:",
  typeof subscriptionRoutes
);

console.log(
  "quoteRoutes:",
  typeof quoteRoutes
);

console.log(
  "teamRoutes:",
  typeof teamRoutes
);

console.log(
  "businessMemberRoutes:",
  typeof businessMemberRoutes
);

console.log(
  "paymentRoutes:",
  typeof paymentRoutes
);

console.log(
  "advancedReportsRoutes:",
  typeof advancedReportsRoutes
);

console.log(
  "notificationRoutes:",
  typeof notificationRoutes
);

console.log(
  "settingsRoutes:",
  typeof settingsRoutes
);

console.log(
  "financeRoutes:",
  typeof financeRoutes
);

console.log(
  "documentRoutes:",
  typeof documentRoutes
);

console.log(
  "supplierRoutes:",
  typeof supplierRoutes
);

console.log(
  "globalSearchRoutes:",
  typeof globalSearchRoutes
);

console.log(
  "marketplaceRoutes:",
  typeof marketplaceRoutes
);

console.log(
  "marketplaceProductRoutes:",
  typeof marketplaceProductRoutes
);

// =====================================================
// NEW ENGINES
// =====================================================

console.log(
  "accountingRoutes:",
  typeof accountingRoutes
);

console.log(
  "analyticsRoutes:",
  typeof analyticsRoutes
);

console.log(
  "businessInsightsRoutes:",
  typeof businessInsightsRoutes
);

console.log(
  "billingRoutes:",
  typeof billingRoutes
);

console.log(
  "===================================="
);

// =====================================================
// REGISTER ROUTES
// =====================================================

// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// Administrator control centre
app.use(
  "/api/admin",
  adminRoutes
);

// =====================================================
// MARKETPLACE PRODUCTS
// =====================================================

app.use(
  "/api/marketplace/products",
  marketplaceProductRoutes
);

// =====================================================
// SUPPLIERS
// =====================================================

app.use(
  "/api/suppliers",
  supplierRoutes
);

// =====================================================
// USERS / PROFILE
// =====================================================

app.use(
  "/api/search",
  globalSearchRoutes
);

app.use(
  "/api/users",
  profileRoutes
);

// =====================================================
// BUSINESSES
// =====================================================

app.use(
  "/api/businesses",
  businessRoutes
);

// =====================================================
// PRODUCTS
// =====================================================

app.use(
  "/api/products",
  productRoutes
);

// =====================================================
// ORDERS
// =====================================================

app.use(
  "/api/orders",
  orderRoutes
);

// =====================================================
// INVENTORY
// =====================================================

app.use(
  "/api/inventory",
  inventoryRoutes
);

// =====================================================
// CUSTOMERS
// =====================================================

app.use(
  "/api/customers",
  customerRoutes
);

// =====================================================
// RECEIPTS
// =====================================================

app.use(
  "/api/receipts",
  receiptRoutes
);

// =====================================================
// INVOICES
// =====================================================

app.use(
  "/api/invoices",
  invoiceRoutes
);

// =====================================================
// EXPENSES
// =====================================================

app.use(
  "/api/expenses",
  expenseRoutes
);

// =====================================================
// REPORTS
// =====================================================

app.use(
  "/api/reports",
  reportRoutes
);

// =====================================================
// DASHBOARD
// =====================================================

app.use(
  "/api/dashboard",
  dashboardRoutes
);

// =====================================================
// FORECAST
// =====================================================

app.use(
  "/api/forecast",
  forecastRoutes
);

// =====================================================
// BUSINESS HEALTH
// =====================================================

app.use(
  "/api/health",
  healthRoutes
);

// =====================================================
// AI
// =====================================================

app.use(
  "/api/ai",
  aiRoutes
);

// =====================================================
// SUBSCRIPTIONS
// =====================================================

app.use(
  "/api/subscriptions",
  subscriptionRoutes
);

// =====================================================
// QUOTES
// =====================================================

app.use(
  "/api/quotes",
  quoteRoutes
);

// =====================================================
// TEAM
// =====================================================

app.use(
  "/api/team",
  teamRoutes
);

// =====================================================
// BUSINESS MEMBERS
// =====================================================

app.use(
  "/api/business-members",
  businessMemberRoutes
);

// =====================================================
// PAYMENTS
// =====================================================

app.use(
  "/api/payments",
  paymentRoutes
);

// =====================================================
// ADVANCED REPORTS
// =====================================================

app.use(
  "/api/advanced-reports",
  advancedReportsRoutes
);

// =====================================================
// NOTIFICATIONS
// =====================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// SETTINGS
// =====================================================

app.use(
  "/api/settings",
  settingsRoutes
);

// =====================================================
// DOCUMENTS
// =====================================================

app.use(
  "/api/documents",
  documentRoutes
);

// =====================================================
// FINANCE ENGINE
// =====================================================

app.use(
  "/api/finance",
  financeRoutes
);

// =====================================================
// ACCOUNTING ENGINE
// =====================================================

app.use(
  "/api/accounting",
  accountingRoutes
);

// =====================================================
// ANALYTICS ENGINE
// =====================================================

app.use(
  "/api/analytics",
  analyticsRoutes
);

// =====================================================
// BUSINESS INSIGHTS ENGINE
// =====================================================

app.use(
  "/api/business-insights",
  businessInsightsRoutes
);

// =====================================================
// BILLING ENGINE
// =====================================================

app.use(
  "/api/billing",
  billingRoutes
);

// =====================================================
// MARKETPLACE
// =====================================================

app.use(
  "/api/marketplace",
  marketplaceRoutes
);

// =====================================================
// STATIC FRONTEND / PUBLIC FILES
// =====================================================

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);

// =====================================================
// HOME
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      message:
        "BusyBiz API running successfully",

      status:
        "online",
    });
  }
);

// =====================================================
// 404 API HANDLER
// =====================================================

app.use(
  (req, res, next) => {
    if (
      req.path.startsWith("/api/")
    ) {
      return res.status(404).json({
        success: false,

        message:
          "API route not found",

        path:
          req.originalUrl,
      });
    }

    next();
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "GLOBAL ERROR:",
      error
    );

    const statusCode =
      error.statusCode ||
      error.status ||
      500;

    res.status(
      statusCode
    ).json({
      success: false,

      message:
        error.message ||
        "Internal server error",
    });
  }
);

// =====================================================
// DATABASE
// =====================================================

connectDB().then(() => ensureAdmin()).catch((error) => console.error("ADMIN BOOTSTRAP ERROR:", error));

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  () => {
    console.log(
      "===================================="
    );

    console.log(
      `BusyBiz server running on port ${PORT}`
    );

    console.log(
      `API: http://localhost:${PORT}`
    );

    console.log(
      "===================================="
    );
  }
);