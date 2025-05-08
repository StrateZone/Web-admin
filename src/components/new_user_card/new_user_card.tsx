import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserPlus } from "lucide-react";
import { config } from "../../../config";
import axiosInstance from "@/utils/axiosInstance";

interface Props {
  year: number;
  month: number;
}

const NewUsersCard: React.FC<Props> = ({ year, month }) => {
  const backendApi = config.BACKEND_API;
  const [newUsers, setNewUsers] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNewUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `${backendApi}/analytics/new-users/year/${year}/month/${month}`,
      );
      setNewUsers(res.data.usersJoined);
    } catch (error) {
      console.error("Lỗi khi fetch người dùng mới:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewUsers();
  }, [year, month]);

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4 w-full max-w-sm">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <UserPlus size={24} />
      </div>
      <div>
        <p className="text-sm text-black">Người dùng mới trong tháng</p>
        <h2 className="text-xl font-semibold text-black">
          {isLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
          ) : newUsers !== null ? (
            newUsers
          ) : (
            "—"
          )}
        </h2>
      </div>
    </div>
  );
};

export default NewUsersCard;
