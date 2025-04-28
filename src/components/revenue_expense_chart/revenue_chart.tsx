import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { config } from "../../../config";

type DayTransaction = {
  dayOfMonth: number;
  booking: number;
  memberShip: number;
  spending: number;
  refund: number;
  voucher: number;
  deposit: number;
};

interface Props {
  year: number;
  month: number;
}

const RevenueChart: React.FC<Props> = ({ year, month }) => {
  const [data, setData] = useState<DayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const backendApi = config.BACKEND_API;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${backendApi}/analytics/transaction-report/year/${year}/month/${month}`,
        );

        const today = new Date();
        const isCurrentMonth =
          today.getMonth() + 1 === month && today.getFullYear() === year;
        const currentDate = today.getDate();

        const lastDayOfSelectedMonth = new Date(year, month, 0).getDate();
        const maxDay = isCurrentMonth ? currentDate : lastDayOfSelectedMonth;

        const rawData = res.data.transactionDayResponses;

        const filtered = rawData.filter(
          (item: DayTransaction) => item.dayOfMonth <= maxDay,
        );

        setData(filtered);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu doanh thu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="w-full min-h-[500px] p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-black">
        Doanh thu theo ngày
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dayOfMonth" tick={{ fontSize: 12 }} interval={0} />
            <YAxis
              tickFormatter={(value) => formatCurrency(Number(value))}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ fontSize: "13px" }}
              labelStyle={{ color: "#000" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="deposit" name="Nạp tiền" fill="#34d399" />
            <Bar dataKey="booking" name="Đặt bàn" fill="#de4ad4" />
            <Bar dataKey="memberShip" name="Gói hội viên" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
