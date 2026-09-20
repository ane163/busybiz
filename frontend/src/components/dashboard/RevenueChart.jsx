import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = () => {
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ],

    datasets: [
      {
        label: "Revenue",

        data: [
          1200,
          1900,
          3000,
          2800,
          4200,
          5100,
          6500,
        ],

        borderColor: "#3b82f6",

        backgroundColor: "#3b82f6",

        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-8">

      <h2 className="text-xl font-bold mb-6">

        Revenue Overview

      </h2>

      <Line data={data} options={options} />

    </div>
  );
};

export default RevenueChart;