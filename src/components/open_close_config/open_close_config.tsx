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
  numberof_TopContributors_PerWeek: number;
  max_NumberOfUsers_InvitedToTable: number;
  appointmentRequest_MaxHours_UntilExpiration: number;
  appointmentRequest_MinHours_UntilExpiration: number;
  percentageRefund_IfNot100: number;
  percentageTimeRange_UntilRequestExpiration: number;
  verification_OTP_Duration: number;
  min_Minutes_For_TablesExtend: number;
  max_Minutes_For_TablesExtend: number;
  extendAllow_BeforeMinutes_FromTableComplete: number;
  extendCancel_BeforeMinutes_FromPlayTime: number;
  percentage_Refund_On_ExtendedTables: number;
  max_Tables_Extends_Count: number;
  min_Tables_For_MonthlyAppointment: number;
  enable_AutoCheckin_ForExtendedTables: boolean;
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
  const [verificationDuration, setVerificationDuration] = useState<number>(0);
  const backendApi = config.BACKEND_API;

  const [isEditing, setIsEditing] = useState<boolean>(false); // Trạng thái chỉnh sửa
  const [isSaving, setIsSaving] = useState<boolean>(false); // loading khi save

  useEffect(() => {
    if (systemConfigData) {
      setOpenTime(systemConfigData.openTime?.slice(0, 5) || "");
      setCloseTime(systemConfigData.closeTime?.slice(0, 5) || "");
      setVerificationDuration(systemConfigData?.verification_OTP_Duration);
    }
  }, [systemConfigData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formattedOpenTime = `${openTime}:00`;
      const formattedCloseTime = `${closeTime}:00`;

      await axiosInstance.put(`${backendApi}/system/1`, {
        id: systemConfigData?.id,
        adminId: systemConfigData?.adminId,
        openTime: formattedOpenTime,
        closeTime: formattedCloseTime,
        appointment_Refund100_HoursFromScheduleTime:
          systemConfigData?.appointment_Refund100_HoursFromScheduleTime,
        appointment_Incoming_HoursFromScheduleTime:
          systemConfigData?.appointment_Incoming_HoursFromScheduleTime,
        appointment_Checkin_MinutesFromScheduleTime:
          systemConfigData?.appointment_Checkin_MinutesFromScheduleTime,
        max_NumberOfTables_CancelPerWeek:
          systemConfigData?.max_NumberOfTables_CancelPerWeek,

        contributionPoints_PerThread:
          systemConfigData?.contributionPoints_PerThread,
        contributionPoints_PerComment:
          systemConfigData?.contributionPoints_PerComment,
        userPoints_PerCheckinTable_ByPercentageOfTablesPrice:
          systemConfigData?.userPoints_PerCheckinTable_ByPercentageOfTablesPrice, // đổi về dạng 0.002
        numberof_TopContributors_PerWeek:
          systemConfigData?.numberof_TopContributors_PerWeek,

        max_NumberOfUsers_InvitedToTable:
          systemConfigData?.max_NumberOfUsers_InvitedToTable,
        appointmentRequest_MaxHours_UntilExpiration:
          systemConfigData?.appointmentRequest_MaxHours_UntilExpiration,
        appointmentRequest_MinHours_UntilExpiration:
          systemConfigData?.appointmentRequest_MinHours_UntilExpiration,
        percentageRefund_IfNot100: systemConfigData?.percentageRefund_IfNot100,
        percentageTimeRange_UntilRequestExpiration:
          systemConfigData?.percentageTimeRange_UntilRequestExpiration,
        verification_OTP_Duration: verificationDuration,
        min_Minutes_For_TablesExtend:
          systemConfigData?.min_Minutes_For_TablesExtend,
        max_Minutes_For_TablesExtend:
          systemConfigData?.max_Minutes_For_TablesExtend,
        extendAllow_BeforeMinutes_FromTableComplete:
          systemConfigData?.extendAllow_BeforeMinutes_FromTableComplete,
        extendCancel_BeforeMinutes_FromPlayTime:
          systemConfigData?.extendCancel_BeforeMinutes_FromPlayTime,
        percentage_Refund_On_ExtendedTables:
          systemConfigData?.percentage_Refund_On_ExtendedTables,
        max_Tables_Extends_Count: systemConfigData?.max_Tables_Extends_Count,
        min_Tables_For_MonthlyAppointment:
          systemConfigData?.min_Tables_For_MonthlyAppointment,
        enable_AutoCheckin_ForExtendedTables:
          systemConfigData?.enable_AutoCheckin_ForExtendedTables,
        status: systemConfigData?.status,
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

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian hết hạn của OTP
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {verificationDuration} phút
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={verificationDuration}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setVerificationDuration(Number(e.target.value));
                    }
                  }}
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
                  onClick={() => {
                    setIsEditing(false);
                    setOpenTime(systemConfigData?.openTime?.slice(0, 5) || "");
                    setCloseTime(
                      systemConfigData?.closeTime?.slice(0, 5) || "",
                    );
                    setVerificationDuration(
                      systemConfigData?.verification_OTP_Duration || 0,
                    );
                  }}
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
