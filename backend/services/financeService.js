const Invoice = require("../models/Invoice");
const InvoicePayment = require("../models/InvoicePayment");
const Expense = require("../models/Expense");
const Order = require("../models/Order");


// =====================================================
// DATE HELPERS
// =====================================================

const buildDateMatch = (field, startDate, endDate) => {

  if (!startDate && !endDate) {
    return {};
  }

  const range = {};

  if (startDate) {
    range.$gte = new Date(startDate);
  }

  if (endDate) {

    const end = new Date(endDate);

    // Include the entire end date
    end.setHours(23, 59, 59, 999);

    range.$lte = end;
  }

  return {
    [field]: range
  };
};


// =====================================================
// ORDER REVENUE
// =====================================================

const getOrderRevenue = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const match = {
    business: businessId,
    status: "completed",
    paymentStatus: "paid",
    ...buildDateMatch(
      "createdAt",
      startDate,
      endDate
    )
  };

  const result = await Order.aggregate([

    {
      $match: match
    },

    {
      $group: {

        _id: null,

        total: {
          $sum: "$total"
        },

        count: {
          $sum: 1
        }

      }
    }

  ]);

  return {

    total:
      Number(result[0]?.total || 0),

    count:
      Number(result[0]?.count || 0)

  };
};


// =====================================================
// INVOICE REVENUE
// =====================================================

const getInvoiceRevenue = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const match = {

    business:
      businessId,

    status:
      "completed",

    ...buildDateMatch(
      "paymentDate",
      startDate,
      endDate
    )

  };

  const result =
    await InvoicePayment.aggregate([

      {
        $match:
          match
      },

      {
        $group: {

          _id: null,

          total: {
            $sum: "$amount"
          },

          count: {
            $sum: 1
          }

        }

      }

    ]);

  return {

    total:
      Number(result[0]?.total || 0),

    count:
      Number(result[0]?.count || 0)

  };
};


// =====================================================
// TOTAL REVENUE
// =====================================================

const getRevenue = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const [
    orders,
    invoices
  ] = await Promise.all([

    getOrderRevenue({
      businessId,
      startDate,
      endDate
    }),

    getInvoiceRevenue({
      businessId,
      startDate,
      endDate
    })

  ]);

  return {

    orders:
      orders.total,

    invoices:
      invoices.total,

    total:
      orders.total +
      invoices.total,

    orderCount:
      orders.count,

    invoicePaymentCount:
      invoices.count

  };
};


// =====================================================
// INVOICE PAYMENTS
// =====================================================

const getInvoicePayments = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const match = {

    business:
      businessId,

    status:
      "completed",

    ...buildDateMatch(
      "paymentDate",
      startDate,
      endDate
    )

  };

  const result =
    await InvoicePayment.aggregate([

      {
        $match:
          match
      },

      {
        $group: {

          _id: null,

          total: {
            $sum: "$amount"
          },

          count: {
            $sum: 1
          }

        }

      }

    ]);

  return {

    total:
      Number(result[0]?.total || 0),

    count:
      Number(result[0]?.count || 0)

  };
};


// =====================================================
// EXPENSES
// =====================================================

const getExpenses = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const match = {

    business:
      businessId,

    ...buildDateMatch(
      "date",
      startDate,
      endDate
    )

  };

  const result =
    await Expense.aggregate([

      {
        $match:
          match
      },

      {
        $group: {

          _id: null,

          total: {
            $sum: "$amount"
          },

          count: {
            $sum: 1
          }

        }

      }

    ]);

  return {

    total:
      Number(result[0]?.total || 0),

    count:
      Number(result[0]?.count || 0)

  };
};


// =====================================================
// EXPENSE BREAKDOWN
// =====================================================

const getExpenseBreakdown = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const match = {

    business:
      businessId,

    ...buildDateMatch(
      "date",
      startDate,
      endDate
    )

  };

  return Expense.aggregate([

    {
      $match:
        match
    },

    {
      $group: {

        _id:
          "$category",

        amount: {
          $sum:
            "$amount"
        }

      }

    },

    {
      $project: {

        _id: 0,

        category: {
          $ifNull: [
            "$_id",
            "Other"
          ]
        },

        amount: 1

      }

    },

    {
      $sort: {
        amount: -1
      }

    }

  ]);
};


// =====================================================
// PROFIT & LOSS
// =====================================================

const getProfitLoss = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const [
    revenue,
    expenses
  ] = await Promise.all([

    getRevenue({
      businessId,
      startDate,
      endDate
    }),

    getExpenses({
      businessId,
      startDate,
      endDate
    })

  ]);

  const totalRevenue =
    Number(revenue.total || 0);

  const totalExpenses =
    Number(expenses.total || 0);

  const profit =
    totalRevenue -
    totalExpenses;

  const profitMargin =
    totalRevenue > 0
      ? (profit / totalRevenue) * 100
      : 0;

  return {

    revenue:
      totalRevenue,

    expenses:
      totalExpenses,

    profit,

    profitMargin,

    orders:
      revenue.orderCount,

    invoicePayments:
      revenue.invoicePaymentCount,

    expenseCount:
      expenses.count

  };
};


// =====================================================
// OUTSTANDING INVOICES
// =====================================================

const getOutstandingInvoices = async ({
  businessId
}) => {

  const invoices =
    await Invoice.aggregate([

      {
        $match: {

          business:
            businessId,

          paymentStatus: {
            $in: [
              "unpaid",
              "partially_paid",
              "overdue"
            ]
          }

        }

      },

      {
        $lookup: {

          from:
            "invoicepayments",

          let: {
            invoiceId: "$_id"
          },

          pipeline: [

            {
              $match: {

                $expr: {

                  $and: [

                    {
                      $eq: [
                        "$invoice",
                        "$$invoiceId"
                      ]
                    },

                    {
                      $eq: [
                        "$business",
                        businessId
                      ]
                    },

                    {
                      $eq: [
                        "$status",
                        "completed"
                      ]
                    }

                  ]

                }

              }

            },

            {
              $group: {

                _id: null,

                paid: {
                  $sum: "$amount"
                }

              }

            }

          ],

          as:
            "payments"

        }

      },

      {
        $addFields: {

          paidAmount: {
            $ifNull: [
              {
                $arrayElemAt: [
                  "$payments.paid",
                  0
                ]
              },
              0
            ]
          }

        }

      },

      {
        $addFields: {

          outstandingAmount: {

            $max: [

              0,

              {
                $subtract: [
                  "$total",
                  "$paidAmount"
                ]
              }

            ]

          }

        }

      },

      {
        $lookup: {

          from:
            "customers",

          localField:
            "customer",

          foreignField:
            "_id",

          as:
            "customer"

        }

      },

      {
        $unwind: {

          path:
            "$customer",

          preserveNullAndEmptyArrays:
            true

        }

      },

      {
        $sort: {
          dueDate: 1
        }

      }

    ]);

  const totalOutstanding =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.outstandingAmount || 0
        ),
      0
    );

  return {

    invoices,

    totalOutstanding

  };
};


// =====================================================
// OVERDUE INVOICES
// =====================================================

const getOverdueInvoices = async ({
  businessId
}) => {

  const now =
    new Date();

  return Invoice.find({

    business:
      businessId,

    dueDate: {
      $lt:
        now
    },

    paymentStatus: {
      $in: [
        "unpaid",
        "partially_paid",
        "overdue"
      ]
    }

  })
    .populate("customer")
    .sort({
      dueDate: 1
    });
};


// =====================================================
// FINANCE SUMMARY
// =====================================================

const getFinanceSummary = async ({
  businessId,
  startDate = null,
  endDate = null
}) => {

  const [
    revenue,
    expenses,
    profitLoss,
    outstanding,
    overdue
  ] = await Promise.all([

    getRevenue({
      businessId,
      startDate,
      endDate
    }),

    getExpenses({
      businessId,
      startDate,
      endDate
    }),

    getProfitLoss({
      businessId,
      startDate,
      endDate
    }),

    getOutstandingInvoices({
      businessId
    }),

    getOverdueInvoices({
      businessId
    })

  ]);

  return {

    revenue,

    expenses,

    profit: {

      net:
        profitLoss.profit,

      margin:
        profitLoss.profitMargin

    },

    outstanding: {

      amount:
        outstanding.totalOutstanding,

      invoices:
        outstanding.invoices.length

    },

    overdue: {

      amount:
        overdue.reduce(
          (sum, invoice) =>
            sum +
            Number(
              invoice.total || 0
            ),
          0
        ),

      invoices:
        overdue.length

    }

  };
};


// =====================================================
// MONTHLY PERFORMANCE
// =====================================================

const getMonthly = async ({
  businessId,
  year = new Date().getFullYear()
}) => {

  const start =
    new Date(
      Number(year),
      0,
      1
    );

  const end =
    new Date(
      Number(year) + 1,
      0,
      1
    );

  const [
    orders,
    payments,
    expenses
  ] = await Promise.all([

    Order.aggregate([

      {
        $match: {

          business:
            businessId,

          status:
            "completed",

          paymentStatus:
            "paid",

          createdAt: {
            $gte:
              start,

            $lt:
              end
          }

        }

      },

      {
        $group: {

          _id:
            {
              $month:
                "$createdAt"
            },

          revenue: {
            $sum:
              "$total"
          }

        }

      }

    ]),

    InvoicePayment.aggregate([

      {
        $match: {

          business:
            businessId,

          status:
            "completed",

          paymentDate: {

            $gte:
              start,

            $lt:
              end

          }

        }

      },

      {
        $group: {

          _id:
            {
              $month:
                "$paymentDate"
            },

          revenue: {
            $sum:
              "$amount"
          }

        }

      }

    ]),

    Expense.aggregate([

      {
        $match: {

          business:
            businessId,

          date: {

            $gte:
              start,

            $lt:
              end

          }

        }

      },

      {
        $group: {

          _id:
            {
              $month:
                "$date"
            },

          expenses: {
            $sum:
              "$amount"
          }

        }

      }

    ])

  ]);

  const months = [];

  for (
    let month = 1;
    month <= 12;
    month++
  ) {

    const orderData =
      orders.find(
        item =>
          item._id === month
      );

    const paymentData =
      payments.find(
        item =>
          item._id === month
      );

    const expenseData =
      expenses.find(
        item =>
          item._id === month
      );

    const revenue =
      Number(
        orderData?.revenue || 0
      ) +
      Number(
        paymentData?.revenue || 0
      );

    const expense =
      Number(
        expenseData?.expenses || 0
      );

    months.push({

      month:

        new Date(
          2000,
          month - 1,
          1
        ).toLocaleString(
          "en-US",
          {
            month:
              "short"
          }
        ),

      revenue,

      expenses:
        expense,

      profit:
        revenue - expense

    });

  }

  return months;
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  getRevenue,

  getInvoicePayments,

  getExpenses,

  getExpenseBreakdown,

  getProfitLoss,

  getOutstandingInvoices,

  getOverdueInvoices,

  getFinanceSummary,

  getMonthly

};