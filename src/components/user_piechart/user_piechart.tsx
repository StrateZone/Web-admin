import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa"];
type User = {
  userId: number;
  userRole: string;
};

const backendApi = config.BACKEND_API;

const UserPieChart = () => {
  const [data, setData] = useState<{ name: string; value: any }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${backendApi}/users/all/dashboard`);
        const users = res.data;

        // Lọc bỏ Admin và Staff
        const filtered = users.filter(
          (user: User) =>
            user.userRole !== "Admin" && user.userRole !== "Staff",
        );

        // Đếm số lượng user theo role
        const countByRole = filtered.reduce(
          (acc: Record<string, number>, user: User) => {
            const role = user.userRole || "Unknown";
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          },
          {},
        );

        // Chuyển sang dạng array cho PieChart
        const chartData = Object.keys(countByRole).map((role) => ({
          name: role,
          value: countByRole[role],
        }));

        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-2xl shadow">
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserPieChart;
