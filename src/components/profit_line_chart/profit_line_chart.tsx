import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import axios from "axios";
import { config } from "../../../config";
import axiosInstance from "@/utils/axiosInstance";

interface ProfitDay {
  dayOfMonth: number;
  profit: number;
}

interface ApiResponse {
  month: string;
  totalDays: number;
  profit: number;
  profitDailyResponses: ProfitDay[];
}

// 🧩 Nhận props year + month
interface ProfitLineChartProps {
  year: number;
  month: number;
}

const ProfitLineChart = ({ year, month }: ProfitLineChartProps) => {
  const [data, setData] = useState<{ day: number; profit: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const backendApi = config.BACKEND_API;
  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>(
          `${backendApi}/analytics/profit/year/${year}/month/${month}`,
        );
        const apiData = response.data;

        const dayMap = new Map(
          apiData.profitDailyResponses.map((item) => [
            item.dayOfMonth,
            item.profit,
          ]),
        );
        const fullData = Array.from({ length: apiData.totalDays }, (_, i) => ({
          day: i + 1,
          profit: dayMap.get(i + 1) ?? 0,
        }));

        setData(fullData);
      } catch (error) {
        console.error("Failed to fetch profit data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, [year, month]); // 📌 Re-fetch mỗi khi year hoặc month thay đổi

  return (
    <div className="w-full min-h-[510px] p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-black">
        Lợi nhuận theo ngày
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 13 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(Number(value))}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any) => `${value.toLocaleString()} VND`}
              labelFormatter={(label: any) => `Ngày ${label}`}
            />
            <ReferenceLine y={0} stroke="red" />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#8884d8"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProfitLineChart;
