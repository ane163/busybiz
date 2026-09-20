const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Expense = require("../models/Expense");
const Inventory = require("../models/Inventory");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const requirePlan = require(
  "../middleware/subscriptionMiddleware"
);

const router = express.Router();


// =====================================================
// DASHBOARD ANALYTICS
// =====================================================

router.get(
  "/summary",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const businessId =
        req.business._id;


      const [
        orders,
        products,
        customers,
        invoices,
        expenses,
        inventory
      ] = await Promise.all([

        Order.find({
          business:
            businessId
        }),

        Product.find({
          business:
            businessId
        }),

        Customer.find({
          business:
            businessId
        }),

        Invoice.find({
          business:
            businessId
        }),

        Expense.find({
          business:
            businessId
        }),

        Inventory.find({
          business:
            businessId
        })

      ]);


      // =================================================
      // SALES
      // =================================================

      let totalSales = 0;

      let paidOrders = 0;


      for (
        const order
        of orders
      ) {

        if (
          order.paymentStatus ===
          "paid"
        ) {

          const amount =
            Number(
              order.total || 0
            );

          if (
            Number.isFinite(amount)
          ) {

            totalSales += amount;

          }

          paidOrders++;

        }

      }


      // =================================================
      // INVOICES
      // =================================================

      let invoiceRevenue = 0;

      let outstandingInvoices = 0;

      let outstandingAmount = 0;


      for (
        const invoice
        of invoices
      ) {

        const amount =
          Number(
            invoice.total || 0
          );


        if (
          !Number.isFinite(amount)
        ) {

          continue;

        }


        if (
          invoice.paymentStatus ===
          "paid"
        ) {

          invoiceRevenue +=
            amount;

        }


        if (
          [
            "unpaid",
            "partially_paid",
            "overdue"
          ].includes(
            invoice.paymentStatus
          )
        ) {

          outstandingInvoices++;

          outstandingAmount +=
            amount;

        }

      }


      // =================================================
      // EXPENSES
      // =================================================

      let totalExpenses = 0;


      for (
        const expense
        of expenses
      ) {

        const amount =
          Number(
            expense.amount || 0
          );


        if (
          Number.isFinite(amount)
        ) {

          totalExpenses +=
            amount;

        }

      }


      // =================================================
      // INVENTORY
      // =================================================

      let inventoryValue = 0;

      let lowStockProducts = 0;

      let outOfStockProducts = 0;


      for (
        const item
        of inventory
      ) {

        const quantity =
          Number(
            item.quantity || 0
          );


        const lowStockLimit =
          Number(
            item.lowStockLimit || 0
          );


        const product =
          products.find(
            product =>
              String(
                product._id
              ) ===
              String(
                item.product
              )
          );


        const price =
          product
            ? Number(
                product.price || 0
              )
            : 0;


        if (
          Number.isFinite(quantity) &&
          Number.isFinite(price)
        ) {

          inventoryValue +=
            quantity * price;

        }


        if (
          quantity <= 0
        ) {

          outOfStockProducts++;

        } else if (
          quantity <=
          lowStockLimit
        ) {

          lowStockProducts++;

        }

      }


      // =================================================
      // NET PROFIT
      // =================================================

      const totalRevenue =
        totalSales +
        invoiceRevenue;


      const netProfit =
        totalRevenue -
        totalExpenses;


      const profitMargin =
        totalRevenue > 0
          ? (
              netProfit /
              totalRevenue
            ) * 100
          : 0;


      // =================================================
      // RESPONSE
      // =================================================

      res.status(200).json({

        sales: {

          total:
            Number(
              totalSales.toFixed(2)
            ),

          paidOrders

        },

        invoices: {

          revenue:
            Number(
              invoiceRevenue.toFixed(2)
            ),

          outstanding:
            outstandingInvoices,

          outstandingAmount:
            Number(
              outstandingAmount.toFixed(2)
            )

        },

        expenses: {

          total:
            Number(
              totalExpenses.toFixed(2)
            )

        },

        profit: {

          net:
            Number(
              netProfit.toFixed(2)
            ),

          margin:
            Number(
              profitMargin.toFixed(2)
            )

        },

        business: {

          products:
            products.length,

          customers:
            customers.length,

          orders:
            orders.length

        },

        inventory: {

          value:
            Number(
              inventoryValue.toFixed(2)
            ),

          lowStock:
            lowStockProducts,

          outOfStock:
            outOfStockProducts

        }

      });

    } catch (error) {

      console.error(
        "ANALYTICS SUMMARY ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load analytics"

      });

    }

  }
);


// =====================================================
// SALES BY PRODUCT
// =====================================================

router.get(
  "/top-products",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const orders =
        await Order.find({
          business:
            req.business._id
        });


      const productSales = {};


      for (
        const order
        of orders
      ) {

        for (
          const item
          of order.items || []
        ) {

          const productId =
            item.product
              ? String(
                  item.product
                )
              : "unknown";


          if (
            !productSales[
              productId
            ]
          ) {

            productSales[
              productId
            ] = {

              product:
                item.product,

              name:
                item.name ||
                "Unknown Product",

              quantity:
                0,

              revenue:
                0

            };

          }


          const quantity =
            Number(
              item.quantity || 0
            );


          const subtotal =
            Number(
              item.subtotal ||
              (
                Number(
                  item.price || 0
                ) *
                quantity
              )
            );


          if (
            Number.isFinite(quantity)
          ) {

            productSales[
              productId
            ].quantity +=
              quantity;

          }


          if (
            Number.isFinite(subtotal)
          ) {

            productSales[
              productId
            ].revenue +=
              subtotal;

          }

        }

      }


      const result =
        Object.values(
          productSales
        )
          .map(
            item => ({

              ...item,

              revenue:
                Number(
                  item.revenue.toFixed(2)
                )

            })
          )
          .sort(
            (a, b) =>
              b.quantity -
              a.quantity
          )
          .slice(
            0,
            10
          );


      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(
        "TOP PRODUCTS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load top products"

      });

    }

  }
);


// =====================================================
// RECENT ORDERS
// =====================================================

router.get(
  "/recent-orders",
  protect,
  businessAccess,
  requirePlan([
    "free",
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const orders =
        await Order.find({
          business:
            req.business._id
        })
          .populate(
            "customer"
          )
          .sort({
            createdAt:
              -1
          })
          .limit(10);


      res.status(200).json(
        orders
      );

    } catch (error) {

      console.error(
        "RECENT ORDERS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load recent orders"

      });

    }

  }
);


// =====================================================
// CUSTOMER ANALYTICS
// =====================================================

router.get(
  "/customers",
  protect,
  businessAccess,
  requirePlan([
    "starter",
    "professional"
  ]),
  async (req, res) => {

    try {

      const [
        customers,
        orders
      ] = await Promise.all([

        Customer.find({
          business:
            req.business._id
        }),

        Order.find({
          business:
            req.business._id
        })

      ]);


      const customerStats = {};


      for (
        const order
        of orders
      ) {

        if (
          !order.customer
        ) {

          continue;

        }


        const customerId =
          String(
            order.customer
          );


        if (
          !customerStats[
            customerId
          ]
        ) {

          customerStats[
            customerId
          ] = {

            customer:
              order.customer,

            orders:
              0,

            spent:
              0

          };

        }


        customerStats[
          customerId
        ].orders++;


        const amount =
          Number(
            order.total || 0
          );


        if (
          Number.isFinite(amount)
        ) {

          customerStats[
            customerId
          ].spent +=
            amount;

        }

      }


      const result =
        customers.map(
          customer => {

            const stats =
              customerStats[
                String(
                  customer._id
                )
              ];


            return {

              customer,

              orders:
                stats
                  ? stats.orders
                  : 0,

              spent:
                stats
                  ? Number(
                      stats.spent.toFixed(
                        2
                      )
                    )
                  : 0

            };

          }
        )
          .sort(
            (a, b) =>
              b.spent -
              a.spent
          );


      res.status(200).json(
        result
      );

    } catch (error) {

      console.error(
        "CUSTOMER ANALYTICS ERROR:",
        error
      );

      res.status(500).json({

        message:
          error.message ||
          "Unable to load customer analytics"

      });

    }

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;