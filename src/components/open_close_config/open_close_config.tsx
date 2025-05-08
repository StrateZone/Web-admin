import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { config } from "../../../config";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

export type SystemConfig = {
  id: number;
  adminId: number;
  openTime: string; // dạng "HH:mm:ss"
  closeTime: string; // dạng "HH:mm:ss"
  appointment_Refund100_HoursFromScheduleTime: number; // số thực (có thể có .5)
  appointment_Incoming_HoursFromScheduleTime: number; // số thực
  appointment_Checkin_MinutesFromScheduleTime: number; // phút, số nguyên
  max_NumberOfTables_CancelPerWeek: number; // số nguyên
  contributionPoints_PerThread: number; // điểm
  contributionPoints_PerComment: number; // điểm
  userPoints_PerCheckinTable_ByPercentageOfTablesPrice: number; // tỷ lệ (0.002 = 0.2%)
  status: string; //status
};

type OpenCloseConfigProps = {
  systemConfigData: SystemConfig | null;
  isLoading: boolean;
};

export default function OpenCloseConfig({
  systemConfigData,
  isLoading,
}: OpenCloseConfigProps) {
  const [openTime, setOpenTime] = useState<string>("");
  const [closeTime, setCloseTime] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const backendApi = config.BACKEND_API;

  const [isEditing, setIsEditing] = useState<boolean>(false); // Trạng thái chỉnh sửa
  const [isSaving, setIsSaving] = useState<boolean>(false); // loading khi save

  useEffect(() => {
    if (systemConfigData) {
      setOpenTime(systemConfigData.openTime?.slice(0, 5) || "");
      setCloseTime(systemConfigData.closeTime?.slice(0, 5) || "");
      setStatus(systemConfigData.status || "active");
    }
  }, [systemConfigData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put(`${backendApi}/system/working-hour/1`, {
        openHour: openTime + ":00",
        closeHour: closeTime + ":00",
      });
      console.log("Cập nhật thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật giờ hoạt động:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto px-6 py-4">
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-8 p-6 flex justify-between items-center"
      >
        <Typography variant="h6" color="white">
          Giờ Hoạt Động
        </Typography>
        {!isEditing && !isLoading && (
          <AiOutlineEdit
            className="cursor-pointer text-white"
            size={20}
            onClick={() => setIsEditing(true)}
          />
        )}
      </CardHeader>

      <CardBody>
        {isLoading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : (
          <div className="space-y-6">
            {/* Thời gian mở cửa */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian mở cửa
              </Typography>
              {!isEditing ? (
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="text-lg font-semibold"
                >
                  {openTime}
                </Typography>
              ) : (
                <select
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Thời gian đóng cửa */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian đóng cửa
              </Typography>
              {!isEditing ? (
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="text-lg font-semibold"
                >
                  {closeTime}
                </Typography>
              ) : (
                <select
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <option key={i} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4">
                <Button color="green" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  color="red"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
