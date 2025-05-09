import React, { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { config } from "../../../config";

interface Props {
  year: number;
  month: number;
}

const ThreadsCreatedCard: React.FC<Props> = ({ year, month }) => {
  const [threadsData, setThreadsData] = useState<number | null>(null);

  const backendApi = config.BACKEND_API;
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchThreadsData = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `${backendApi}/analytics/threads-report/year/${year}/month/${month}`,
      );
      setThreadsData(res.data);
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu bài viết:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchThreadsData();
  }, [year, month]);

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4 w-full max-w-sm">
      <div className="bg-green-100 text-green-600 p-3 rounded-full">
        <MessageSquareText size={24} />
      </div>
      <div>
        <p className="text-sm text-black">Số bài viết đã tạo</p>
        <h2 className="text-xl font-semibold text-black">
          {isLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
          ) : threadsData !== null ? (
            threadsData
          ) : (
            "—"
          )}
        </h2>
      </div>
    </div>
  );
};

export default ThreadsCreatedCard;
