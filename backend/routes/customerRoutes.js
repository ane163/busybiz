const express = require("express");

const Customer = require("../models/Customer");
const Order = require("../models/Order");

const protect = require("../middleware/authMiddleware");

const {
  businessAccess,
  requireRole
} = require("../middleware/businessAccessMiddleware");

const router = express.Router();


// =====================================================
// GET ALL CUSTOMERS
// =====================================================

router.get(
  "/",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const customers = await Customer.find({
        business: req.business._id
      }).sort({
        createdAt: -1
      });

      res.status(200).json(customers);

    } catch (error) {
      console.error(
        "GET CUSTOMERS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load customers"
      });
    }
  }
);


// =====================================================
// CUSTOMER SUMMARY
// =====================================================

router.get(
  "/summary",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const customers = await Customer.find({
        business: req.business._id
      });

      const totalCustomers =
        customers.length;

      const activeCustomers =
        customers.filter(
          (customer) =>
            customer.status !== "inactive"
        ).length;

      const inactiveCustomers =
        customers.filter(
          (customer) =>
            customer.status === "inactive"
        ).length;

      const totalOrders =
        await Order.countDocuments({
          business: req.business._id,
          customer: {
            $ne: null
          }
        });

      const revenueResult =
        await Order.aggregate([
          {
            $match: {
              business:
                req.business._id,

              customer: {
                $ne: null
              },

              status: "completed",

              paymentStatus: "paid"
            }
          },

          {
            $group: {
              _id: null,

              totalRevenue: {
                $sum: "$total"
              }
            }
          }
        ]);

      const totalRevenue =
        revenueResult.length > 0
          ? Number(
              revenueResult[0].totalRevenue
            )
          : 0;

      res.status(200).json({
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        totalOrders,
        totalRevenue
      });

    } catch (error) {
      console.error(
        "CUSTOMER SUMMARY ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load customer summary"
      });
    }
  }
);


// =====================================================
// GET CUSTOMER ORDERS
// =====================================================

router.get(
  "/:id/orders",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          _id: req.params.id,
          business: req.business._id
        });

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found"
        });
      }

      const orders =
        await Order.find({
          business:
            req.business._id,

          customer:
            customer._id
        })
          .sort({
            createdAt: -1
          });

      res.status(200).json(
        orders
      );

    } catch (error) {
      console.error(
        "GET CUSTOMER ORDERS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load customer orders"
      });
    }
  }
);


// =====================================================
// GET CUSTOMER STATISTICS
// =====================================================

router.get(
  "/:id/stats",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          _id: req.params.id,
          business: req.business._id
        });

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found"
        });
      }

      const result =
        await Order.aggregate([
          {
            $match: {
              business:
                req.business._id,

              customer:
                customer._id,

              status:
                "completed",

              paymentStatus:
                "paid"
            }
          },

          {
            $group: {
              _id: null,

              totalOrders: {
                $sum: 1
              },

              totalSpent: {
                $sum: "$total"
              }
            }
          }
        ]);

      const stats =
        result.length > 0
          ? result[0]
          : {
              totalOrders: 0,
              totalSpent: 0
            };

      const averageOrderValue =
        stats.totalOrders > 0
          ? Number(
              stats.totalSpent
            ) /
            Number(
              stats.totalOrders
            )
          : 0;

      res.status(200).json({
        customer,
        totalOrders:
          stats.totalOrders,

        totalSpent:
          Number(
            stats.totalSpent
          ),

        averageOrderValue
      });

    } catch (error) {
      console.error(
        "CUSTOMER STATS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load customer statistics"
      });
    }
  }
);


// =====================================================
// GET ONE CUSTOMER
// =====================================================

router.get(
  "/:id",
  protect,
  businessAccess,
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          _id: req.params.id,
          business: req.business._id
        });

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found"
        });
      }

      res.status(200).json(
        customer
      );

    } catch (error) {
      console.error(
        "GET CUSTOMER ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to load customer"
      });
    }
  }
);


// =====================================================
// CREATE CUSTOMER
// =====================================================

router.post(
  "/",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address
      } = req.body;

      if (!name) {
        return res.status(400).json({
          message:
            "Customer name is required"
        });
      }

      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          message:
            "Customer name is required"
        });
      }

      // ================================================
      // CHECK DUPLICATE EMAIL
      // ================================================

      if (email) {
        const existingCustomer =
          await Customer.findOne({
            business:
              req.business._id,

            email:
              String(email)
                .trim()
                .toLowerCase()
          });

        if (existingCustomer) {
          return res.status(400).json({
            message:
              "A customer with this email already exists"
          });
        }
      }

      const customer =
        await Customer.create({
          business:
            req.business._id,

          name:
            cleanName,

          email:
            email
              ? String(email)
                  .trim()
                  .toLowerCase()
              : "",

          phone:
            phone
              ? String(phone).trim()
              : "",

          address:
            address
              ? String(address).trim()
              : ""
        });

      res.status(201).json({
        message:
          "Customer created successfully",

        customer
      });

    } catch (error) {
      console.error(
        "CREATE CUSTOMER ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to create customer"
      });
    }
  }
);


// =====================================================
// UPDATE CUSTOMER
// =====================================================

router.put(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin",
    "manager"
  ),
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          _id: req.params.id,
          business:
            req.business._id
        });

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found"
        });
      }

      const {
        name,
        email,
        phone,
        address,
        status
      } = req.body;

      // ================================================
      // NAME
      // ================================================

      if (name !== undefined) {
        const cleanName =
          String(name).trim();

        if (!cleanName) {
          return res.status(400).json({
            message:
              "Customer name cannot be empty"
          });
        }

        customer.name =
          cleanName;
      }

      // ================================================
      // EMAIL
      // ================================================

      if (email !== undefined) {
        const cleanEmail =
          String(email)
            .trim()
            .toLowerCase();

        if (cleanEmail) {
          const duplicate =
            await Customer.findOne({
              business:
                req.business._id,

              email:
                cleanEmail,

              _id: {
                $ne:
                  customer._id
              }
            });

          if (duplicate) {
            return res.status(400).json({
              message:
                "Another customer already uses this email"
            });
          }
        }

        customer.email =
          cleanEmail;
      }

      // ================================================
      // PHONE
      // ================================================

      if (phone !== undefined) {
        customer.phone =
          String(phone).trim();
      }

      // ================================================
      // ADDRESS
      // ================================================

      if (address !== undefined) {
        customer.address =
          String(address).trim();
      }

      // ================================================
      // STATUS
      // ================================================

      if (status !== undefined) {
        const allowedStatuses = [
          "active",
          "inactive"
        ];

        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid customer status"
          });
        }

        customer.status =
          status;
      }

      await customer.save();

      res.status(200).json({
        message:
          "Customer updated successfully",

        customer
      });

    } catch (error) {
      console.error(
        "UPDATE CUSTOMER ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to update customer"
      });
    }
  }
);


// =====================================================
// DELETE CUSTOMER
// =====================================================

router.delete(
  "/:id",
  protect,
  businessAccess,
  requireRole(
    "owner",
    "admin"
  ),
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          _id: req.params.id,
          business:
            req.business._id
        });

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found"
        });
      }

      // ================================================
      // CHECK CUSTOMER ORDERS
      // ================================================

      const orderCount =
        await Order.countDocuments({
          business:
            req.business._id,

          customer:
            customer._id
        });

      if (orderCount > 0) {
        return res.status(400).json({
          message:
            "This customer has existing orders and cannot be deleted. Set the customer to inactive instead.",

          orderCount
        });
      }

      await Customer.findByIdAndDelete(
        customer._id
      );

      res.status(200).json({
        message:
          "Customer deleted successfully"
      });

    } catch (error) {
      console.error(
        "DELETE CUSTOMER ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Unable to delete customer"
      });
    }
  }
);


module.exports = router;