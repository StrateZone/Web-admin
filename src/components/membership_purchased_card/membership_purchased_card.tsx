import React, { useEffect, useState } from "react";
import { BadgeDollarSign } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { config } from "../../../config";

interface Props {
  year: number;
  month: number;
}
const MembershipsPurchasedCard: React.FC<Props> = ({ year, month }) => {
  const backendApi = config.BACKEND_API;
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(
          `${backendApi}/analytics/memberships-purchased/year/${year}/month/${month}`,
        );
        setCount(res.data.membershipsPurchased);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu membership:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4 w-full max-w-sm">
      <div className="bg-green-100 text-green-600 p-3 rounded-full">
        <BadgeDollarSign size={24} />
      </div>
      <div>
        <p className="text-sm text-black">Số Membership đã thanh toán</p>
        <h2 className="text-xl font-semibold text-black">
          {isLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
          ) : count !== null ? (
            count
          ) : (
            "—"
          )}
        </h2>
      </div>
    </div>
  );
};

export default MembershipsPurchasedCard;
