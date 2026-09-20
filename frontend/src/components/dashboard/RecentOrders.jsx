const RecentOrders = () => {

  const orders = [
    {
      id: "INV-1001",
      customer: "John Smith",
      amount: "$520",
      status: "Paid",
      date: "07 Aug 2026",
    },
    {
      id: "INV-1002",
      customer: "ABC Supermarket",
      amount: "$1,240",
      status: "Pending",
      date: "07 Aug 2026",
    },
    {
      id: "INV-1003",
      customer: "Tech Solutions",
      amount: "$760",
      status: "Paid",
      date: "06 Aug 2026",
    },
    {
      id: "INV-1004",
      customer: "Mary Johnson",
      amount: "$180",
      status: "Cancelled",
      date: "05 Aug 2026",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-8">

      <h2 className="text-xl font-bold mb-6">
        Recent Orders
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">Invoice</th>

              <th className="text-left py-3">Customer</th>

              <th className="text-left py-3">Amount</th>

              <th className="text-left py-3">Status</th>

              <th className="text-left py-3">Date</th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-4">
                  {order.id}
                </td>

                <td>{order.customer}</td>

                <td>{order.amount}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm text-white
                    ${
                      order.status === "Paid"
                        ? "bg-green-500"
                        : order.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {order.status}
                  </span>

                </td>

                <td>{order.date}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default RecentOrders;