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
  const [maxInvitation, setMaxInvitation] = useState<number>(0);
  const [maxInvitationExpiry, setMaxInvitationExpiry] = useState<number>(0);
  const [minInvitationExpiry, setMinInvitationExpiry] = useState<number>(0);
  const [refundOtherThan100, setRefundOtherThan100] = useState<number>(0);
  const [invitaionExpiry, setInvitaionExpiry] = useState<number>(0);

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
      setMaxInvitation(systemConfigData.max_NumberOfUsers_InvitedToTable ?? 0);
      setMaxInvitationExpiry(
        systemConfigData.appointmentRequest_MaxHours_UntilExpiration ?? 0,
      );
      setMinInvitationExpiry(
        systemConfigData.appointmentRequest_MinHours_UntilExpiration ?? 0,
      );
      setRefundOtherThan100(
        (systemConfigData.percentageRefund_IfNot100 ?? 0) * 100,
      );
      setInvitaionExpiry(
        (systemConfigData.percentageTimeRange_UntilRequestExpiration ?? 0) *
          100,
      );
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
        appointment_Refund100_HoursFromScheduleTime: refundHour,
        appointment_Incoming_HoursFromScheduleTime: incomingHour,
        appointment_Checkin_MinutesFromScheduleTime: checkinMinutes,
        max_NumberOfTables_CancelPerWeek: maxCancelPerWeek,
        contributionPoints_PerThread:
          systemConfigData?.contributionPoints_PerThread,
        contributionPoints_PerComment:
          systemConfigData?.contributionPoints_PerComment,
        userPoints_PerCheckinTable_ByPercentageOfTablesPrice:
          systemConfigData?.userPoints_PerCheckinTable_ByPercentageOfTablesPrice,
        numberof_TopContributors_PerWeek:
          systemConfigData?.numberof_TopContributors_PerWeek,
        max_NumberOfUsers_InvitedToTable: maxInvitation,
        appointmentRequest_MaxHours_UntilExpiration: maxInvitationExpiry,
        appointmentRequest_MinHours_UntilExpiration: minInvitationExpiry,
        percentageRefund_IfNot100: refundOtherThan100 / 100,
        percentageTimeRange_UntilRequestExpiration: invitaionExpiry / 100,
        verification_OTP_Duration: systemConfigData?.verification_OTP_Duration,
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
        status: systemConfigData?.status,
      });
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
                Hoàn tiền 100% trước
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
                  placeholder="Tiếng"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setRefundHour(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Chuyển trạng thái sắp diễn ra trước
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  Trước giờ chơi: {formatHourMinute(incomingHour)}
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="Tiếng"
                  value={incomingHour}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setIncomingHour(Number(e.target.value));
                    }
                  }}
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
                  placeholder="Phút"
                  value={checkinMinutes}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setCheckinMinutes(Number(e.target.value));
                    }
                  }}
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
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setMaxCancelPerWeek(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Số lời mời tối đa được gửi khi mời chơi cờ
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {maxInvitation} lời mời
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={maxInvitation}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setMaxInvitation(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian lời mời hết hạn tối đa (tiếng)
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {maxInvitationExpiry} tiếng
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={maxInvitationExpiry}
                  placeholder="Tiếng"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setMaxInvitationExpiry(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian lời mời hết hạn tối thiểu
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {minInvitationExpiry} tiếng
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={minInvitationExpiry}
                  placeholder="Tiếng"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setMinInvitationExpiry(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Thời gian lời mời hết hạn
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {invitaionExpiry} % khoảng thời gian từ lúc bắt đầu đến giờ
                  chơi
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={invitaionExpiry}
                  placeholder="%"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setInvitaionExpiry(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Lượng refund nếu qua mốc thời gian refund 100%
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {refundOtherThan100} %
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={refundOtherThan100}
                  placeholder="%"
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setRefundOtherThan100(Number(e.target.value));
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
                    setRefundHour(
                      systemConfigData?.appointment_Refund100_HoursFromScheduleTime ??
                        0,
                    );
                    setIncomingHour(
                      systemConfigData?.appointment_Incoming_HoursFromScheduleTime ??
                        0,
                    );
                    setCheckinMinutes(
                      systemConfigData?.appointment_Checkin_MinutesFromScheduleTime ??
                        0,
                    );
                    setMaxCancelPerWeek(
                      systemConfigData?.max_NumberOfTables_CancelPerWeek ?? 0,
                    );
                    setMaxInvitation(
                      systemConfigData?.max_NumberOfUsers_InvitedToTable ?? 0,
                    );
                    setMaxInvitationExpiry(
                      systemConfigData?.appointmentRequest_MaxHours_UntilExpiration ??
                        0,
                    );
                    setMinInvitationExpiry(
                      systemConfigData?.appointmentRequest_MinHours_UntilExpiration ??
                        0,
                    );
                    setRefundOtherThan100(
                      (systemConfigData?.percentageRefund_IfNot100 ?? 0) * 100,
                    );
                    setInvitaionExpiry(
                      (systemConfigData?.percentageTimeRange_UntilRequestExpiration ??
                        0) * 100,
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
