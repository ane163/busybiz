const express = require("express");

const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Order = require("../models/Order");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// GLOBAL SEARCH
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {

    try {

      const query =
        String(
          req.query.q || ""
        ).trim();


      // =================================================
      // VALIDATE SEARCH
      // =================================================

      if (!query) {

        return res.status(200).json({
          results: [],
          total: 0
        });

      }


      if (query.length < 2) {

        return res.status(200).json({
          results: [],
          total: 0
        });

      }


      const businessId =
        req.business._id;


      // =================================================
      // REGEX
      // =================================================

      const escapedQuery =
        query.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );


      const regex =
        new RegExp(
          escapedQuery,
          "i"
        );


      // =================================================
      // SEARCH
      // =================================================

      const [

        products,

        customers,

        suppliers,

        orders

      ] = await Promise.all([


        // =================================================
        // PRODUCTS
        // =================================================

        Product.find({

          business:
            businessId,

          $or: [

            {
              name:
                regex
            },

            {
              description:
                regex
            },

            {
              category:
                regex
            }

          ]

        })
          .sort({
            createdAt: -1
          })
          .limit(8)
          .lean(),


        // =================================================
        // CUSTOMERS
        // =================================================

        Customer.find({

          business:
            businessId,

          $or: [

            {
              name:
                regex
            },

            {
              fullName:
                regex
            },

            {
              email:
                regex
            },

            {
              phone:
                regex
            }

          ]

        })
          .sort({
            createdAt: -1
          })
          .limit(8)
          .lean(),


        // =================================================
        // SUPPLIERS
        // =================================================

        Supplier.find({

          business:
            businessId,

          $or: [

            {
              name:
                regex
            },

            {
              companyName:
                regex
            },

            {
              email:
                regex
            },

            {
              phone:
                regex
            }

          ]

        })
          .sort({
            createdAt: -1
          })
          .limit(8)
          .lean(),


        // =================================================
        // ORDERS
        // =================================================

        Order.find({

          business:
            businessId,

          $or: [

            {
              paymentMethod:
                regex
            },

            {
              status:
                regex
            },

            {
              paymentStatus:
                regex
            }

          ]

        })
          .populate(
            "customer",
            "name fullName email phone"
          )
          .sort({
            createdAt: -1
          })
          .limit(8)
          .lean()

      ]);


      // =====================================================
      // FORMAT RESULTS
      // =====================================================

      const results = [];


      // =====================================================
      // PRODUCT RESULTS
      // =====================================================

      products.forEach(
        (product) => {

          results.push({

            id:
              product._id,

            type:
              "product",

            title:
              product.name,

            subtitle:
              product.category ||
              "Product",

            extra:
              `$${Number(
                product.price || 0
              ).toFixed(2)}`,

            path:
              `/products/${product._id}`

          });

        }
      );


      // =====================================================
      // CUSTOMER RESULTS
      // =====================================================

      customers.forEach(
        (customer) => {

          const name =
            customer.name ||
            customer.fullName ||
            "Customer";


          results.push({

            id:
              customer._id,

            type:
              "customer",

            title:
              name,

            subtitle:
              customer.email ||
              customer.phone ||
              "Customer",

            extra:
              "",

            path:
              `/customers/${customer._id}`

          });

        }
      );


      // =====================================================
      // SUPPLIER RESULTS
      // =====================================================

      suppliers.forEach(
        (supplier) => {

          const name =
            supplier.name ||
            supplier.companyName ||
            "Supplier";


          results.push({

            id:
              supplier._id,

            type:
              "supplier",

            title:
              name,

            subtitle:
              supplier.email ||
              supplier.phone ||
              "Supplier",

            extra:
              "",

            path:
              `/suppliers/${supplier._id}`

          });

        }
      );


      // =====================================================
      // ORDER RESULTS
      // =====================================================

      orders.forEach(
        (order) => {

          const customerName =
            order.customer?.name ||
            order.customer?.fullName ||
            "Walk-in Customer";


          results.push({

            id:
              order._id,

            type:
              "order",

            title:
              `Order #${String(
                order._id
              ).slice(-6).toUpperCase()}`,

            subtitle:
              customerName,

            extra:
              `$${Number(
                order.total || 0
              ).toFixed(2)}`,

            path:
              `/orders/${order._id}`

          });

        }
      );


      // =====================================================
      // SORT RESULTS
      // =====================================================

      results.sort(
        (a, b) => {

          const aTitle =
            String(
              a.title || ""
            ).toLowerCase();

          const bTitle =
            String(
              b.title || ""
            ).toLowerCase();


          const search =
            query.toLowerCase();


          const aStarts =
            aTitle.startsWith(
              search
            );

          const bStarts =
            bTitle.startsWith(
              search
            );


          if (
            aStarts &&
            !bStarts
          ) {
            return -1;
          }


          if (
            !aStarts &&
            bStarts
          ) {
            return 1;
          }


          return 0;

        }
      );


      // =====================================================
      // LIMIT TOTAL RESULTS
      // =====================================================

      const finalResults =
        results.slice(
          0,
          25
        );


      // =====================================================
      // RESPONSE
      // =====================================================

      return res.status(200).json({

        results:
          finalResults,

        total:
          finalResults.length

      });


    } catch (error) {

      console.error(
        "GLOBAL SEARCH ERROR:",
        error
      );


      return res.status(500).json({

        message:
          error.message ||
          "Unable to perform global search.",

        results: [],

        total: 0

      });

    }

  }
);


module.exports = router;