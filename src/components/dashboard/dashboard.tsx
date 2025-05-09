import React, { useState } from "react";
import RevenueExpenseChart from "../revenue_expense_chart/revenue_expense_chart";
import UserPieChart from "../user_piechart/user_piechart";
import NewUsersCard from "../new_user_card/new_user_card";
import TableBookingsCard from "../total_table_booked_card/total_table_booked_card";
import ThreadsCreatedCard from "../thread_created_card/thread_created_card";
import MembershipsPurchasedCard from "../membership_purchased_card/membership_purchased_card";
import RevenueChart from "../revenue_expense_chart/revenue_chart";
import ExpenseChart from "../revenue_expense_chart/expense_chart";
import ProfitLineChart from "../profit_line_chart/profit_line_chart";

export default function Dashboard() {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Phần chọn Năm/Tháng */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8 flex flex-wrap gap-6 items-center justify-center">
        <div>
          <label className="mr-2 text-gray-700 font-semibold">Chọn năm:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-3 py-2 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-gray-700 font-semibold">
            Chọn tháng:
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Các Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <NewUsersCard year={year} month={month} />
        <MembershipsPurchasedCard year={year} month={month} />
        <TableBookingsCard year={year} month={month} />
        <ThreadsCreatedCard year={year} month={month} />
      </div>

      {/* Pie chart nhỏ */}
      <div className="mb-8 flex justify-center">
        <div className="bg-white p-6 rounded-2xl shadow w-full max-w-[800px]">
          <UserPieChart />
        </div>
      </div>

      {/* Các biểu đồ lớn xếp dọc */}
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <RevenueChart year={year} month={month} />
        </div>
      </div>
    </div>
  );
}
