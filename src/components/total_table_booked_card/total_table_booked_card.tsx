import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarCheck } from "lucide-react";

interface Props {
  year: number;
  month: number;
}

const TableBookingsCard: React.FC<Props> = ({ year, month }) => {
  const [bookings, setBookings] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://backend-production-ac5e.up.railway.app/api/analytics/tables-appointment-report/year/${year}/month/${month}`,
        );
        setBookings(res.data.tablesAppointmentBooked);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu đặt bàn:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [year, month]);

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4 w-full max-w-sm">
      <div className="bg-green-100 text-green-600 p-3 rounded-full">
        <CalendarCheck size={24} />
      </div>
      <div>
        <p className="text-sm text-black">Tổng lượt đặt bàn trong tháng</p>
        <h2 className="text-xl font-semibold text-black">
          {isLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
          ) : bookings !== null ? (
            bookings
          ) : (
            "—"
          )}
        </h2>
      </div>
    </div>
  );
};

export default TableBookingsCard;
