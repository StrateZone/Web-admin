import React, { useEffect, useState } from "react";
import { config } from "../../../config";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import { AiOutlineEdit } from "react-icons/ai";

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

interface CancelPolicyConfigProps {
  systemConfigData: SystemConfig | null;
  isLoading: boolean;
}

export default function CancelPolicyConfig({
  systemConfigData,
  isLoading,
}: CancelPolicyConfigProps) {
  const backendApi = config.BACKEND_API;

  const [refundHour, setRefundHour] = useState<number>(0);
  const [incomingHour, setIncomingHour] = useState<number>(0);
  const [checkinMinutes, setCheckinMinutes] = useState<number>(0);
  const [maxCancelPerWeek, setMaxCancelPerWeek] = useState<number>(0);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (systemConfigData) {
      setRefundHour(
        systemConfigData.appointment_Refund100_HoursFromScheduleTime ?? 0,
      );
      setIncomingHour(
        systemConfigData.appointment_Incoming_HoursFromScheduleTime ?? 0,
      );
      setCheckinMinutes(
        systemConfigData.appointment_Checkin_MinutesFromScheduleTime ?? 0,
      );
      setMaxCancelPerWeek(
        systemConfigData.max_NumberOfTables_CancelPerWeek ?? 0,
      );
    }
  }, [systemConfigData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${backendApi}/system/1/appointment-time-rules`, {
        refund100_Hours_BeforeScheduleTime: refundHour,
        incoming_Hours_BeforeScheduleTime: incomingHour,
        checkin_Minutes_BeforeScheduleTime: checkinMinutes,
        maxTablesCancel_PerWeek: maxCancelPerWeek,
      });
      console.log("Cập nhật chính sách thành công!");
      setIsEditing(false);
      // Optionally, bạn có thể trigger re-fetch ở component cha
    } catch (error) {
      console.error("Lỗi khi cập nhật chính sách:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  const formatHourMinute = (value: number | null | undefined) => {
    if (value == null) return ""; // check cả null lẫn undefined
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    if (hours > 0 && minutes > 0) return `${hours} tiếng ${minutes} phút`;
    if (hours > 0) return `${hours} tiếng`;
    if (minutes > 0) return `${minutes} phút`;
    return "0 phút";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto px-6 py-4">
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-8 p-6 flex justify-between items-center"
      >
        <Typography variant="h6" color="white">
          Chính Sách Hủy & Checkin
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
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Hoàn tiền 100% trước (giờ)
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  Tối thiểu trước giờ chơi: {formatHourMinute(refundHour)}
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={refundHour}
                  onChange={(e) => setRefundHour(Number(e.target.value))}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Chuyển trạng thái sắp diễn ra trước (giờ)
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  Trước giờ chơi: {formatHourMinute(incomingHour)}
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={incomingHour}
                  onChange={(e) => setIncomingHour(Number(e.target.value))}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Cho phép checkin trước (phút)
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {checkinMinutes} phút
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={checkinMinutes}
                  onChange={(e) => setCheckinMinutes(Number(e.target.value))}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Số lần người dùng hủy bàn tối đa mỗi tuần
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {maxCancelPerWeek} lần
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={maxCancelPerWeek}
                  onChange={(e) => setMaxCancelPerWeek(Number(e.target.value))}
                />
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
