import React, { useState } from "react";
import RevenueExpenseChart from "../revenue_expense_chart/revenue_expense_chart";
import UserPieChart from "../user_piechart/user_piechart";
import NewUsersCard from "../new_user_card/new_user_card";
import TableBookingsCard from "../total_table_booked_card/total_table_booked_card";
import ThreadsCreatedCard from "../thread_created_card/thread_created_card";
import MembershipsPurchasedCard from "../membership_purchased_card/membership_purchased_card";

export default function Dashboard() {
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(4);
  return (
    <div className="min-h-screen bg-gray-400 p-6">
      <div className="flex gap-4">
        <div>
          <label className="mr-2 text-black font-medium">Chọn năm:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded-md text-black"
          >
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-black font-medium">Chọn tháng:</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-2 py-1 rounded-md text-black"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <NewUsersCard year={year} month={month} />
      <MembershipsPurchasedCard year={year} month={month} />
      <TableBookingsCard year={year} month={month} />
      <ThreadsCreatedCard year={year} month={month} />
      <div>
        <UserPieChart />
      </div>
      <div>
        <RevenueExpenseChart year={year} month={month} />
      </div>
    </div>
  );
}
