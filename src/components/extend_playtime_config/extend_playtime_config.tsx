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
  status: string; //status
};

type ExtendPlaytimeConfigProps = {
  systemConfigData: SystemConfig | null;
  isLoading: boolean;
};

export default function ExtendPlaytimeConfig({
  systemConfigData,
  isLoading,
}: ExtendPlaytimeConfigProps) {
  const backendApi = config.BACKEND_API;

  const [minExtend, setMinExtend] = useState<number>(0);
  const [maxExtend, setMaxExtend] = useState<number>(0);
  const [allowBefore, setAllowBefore] = useState<number>(0);
  const [cancelAllow, setCancelAllow] = useState<number>(0);
  const [percentRefund, setPercentRefund] = useState<number>(0);

  const [isEditing, setIsEditing] = useState<boolean>(false); // Trạng thái chỉnh sửa
  const [isSaving, setIsSaving] = useState<boolean>(false); // loading khi save

  useEffect(() => {
    if (systemConfigData) {
      setMinExtend(systemConfigData.min_Minutes_For_TablesExtend);
      setMaxExtend(systemConfigData.max_Minutes_For_TablesExtend);
      setAllowBefore(
        systemConfigData?.extendAllow_BeforeMinutes_FromTableComplete,
      );
      setCancelAllow(systemConfigData.extendCancel_BeforeMinutes_FromPlayTime);
      setPercentRefund(systemConfigData.percentage_Refund_On_ExtendedTables);
    }
  }, [systemConfigData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put(`${backendApi}/system/1`, {
        id: systemConfigData?.id,
        adminId: systemConfigData?.adminId,
        openTime: systemConfigData?.openTime,
        closeTime: systemConfigData?.closeTime,
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
        verification_OTP_Duration: systemConfigData?.verification_OTP_Duration,
        min_Minutes_For_TablesExtend: minExtend,
        max_Minutes_For_TablesExtend: maxExtend,
        extendAllow_BeforeMinutes_FromTableComplete: allowBefore,
        extendCancel_BeforeMinutes_FromPlayTime: cancelAllow,
        percentage_Refund_On_ExtendedTables: percentRefund,
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
          Cấu hình gia hạn giờ chơi
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
                Thời gian tối thiểu được gia hạn
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {minExtend} phút
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={minExtend}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setMinExtend(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian tối đa được gia hạn
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {maxExtend} phút
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={maxExtend}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setMaxExtend(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Cho phép gia hạn khi
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {allowBefore} phút trước khi hết giờ chơi
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={allowBefore}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setAllowBefore(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Cho phép hủy gia hạn khi
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {cancelAllow} phút trước khi hết giờ chơi
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={cancelAllow}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setCancelAllow(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Lượng refund nếu hủy gia hạn
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {percentRefund} %
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={percentRefund}
                  placeholder="%"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setPercentRefund(Number(e.target.value));
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
                    setMinExtend(
                      systemConfigData?.min_Minutes_For_TablesExtend || 0,
                    );
                    setMaxExtend(
                      systemConfigData?.max_Minutes_For_TablesExtend || 0,
                    );
                    setAllowBefore(
                      systemConfigData?.extendAllow_BeforeMinutes_FromTableComplete ||
                        0,
                    );
                    setCancelAllow(
                      systemConfigData?.extendCancel_BeforeMinutes_FromPlayTime ||
                        0,
                    );
                    setPercentRefund(
                      systemConfigData?.percentage_Refund_On_ExtendedTables ||
                        0,
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
