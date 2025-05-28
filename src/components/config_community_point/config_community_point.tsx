import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { config } from "../../../config";
import axios from "axios";
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

interface ConfigCommunityPointProps {
  systemConfigData: SystemConfig | null;
  isLoading: boolean;
}

export default function ConfigCommunityPoint({
  systemConfigData,
  isLoading,
}: ConfigCommunityPointProps) {
  const backendApi = config.BACKEND_API;

  const [pointPerThread, setPointPerThread] = useState<number>(0);
  const [pointPerComment, setPointPerComment] = useState<number>(0);
  const [percentCheckinReward, setPercentCheckinReward] = useState<number>(0);
  const [numberOfTopContributor, setNumberOfTopContributor] =
    useState<number>(0);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (systemConfigData) {
      setPointPerThread(systemConfigData.contributionPoints_PerThread ?? 0);
      setPointPerComment(systemConfigData.contributionPoints_PerComment ?? 0);
      setPercentCheckinReward(
        (systemConfigData.userPoints_PerCheckinTable_ByPercentageOfTablesPrice ??
          0) * 100,
      ); // đổi thành % cho dễ nhập
      setNumberOfTopContributor(
        systemConfigData.numberof_TopContributors_PerWeek ?? 0,
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
        appointment_Refund100_HoursFromScheduleTime:
          systemConfigData?.appointment_Refund100_HoursFromScheduleTime,
        appointment_Incoming_HoursFromScheduleTime:
          systemConfigData?.appointment_Incoming_HoursFromScheduleTime,
        appointment_Checkin_MinutesFromScheduleTime:
          systemConfigData?.appointment_Checkin_MinutesFromScheduleTime,
        max_NumberOfTables_CancelPerWeek:
          systemConfigData?.max_NumberOfTables_CancelPerWeek,

        contributionPoints_PerThread: pointPerThread,
        contributionPoints_PerComment: pointPerComment,
        userPoints_PerCheckinTable_ByPercentageOfTablesPrice:
          percentCheckinReward / 100, // đổi về dạng 0.002
        numberof_TopContributors_PerWeek: numberOfTopContributor,

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
      console.log("Cập nhật thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật điểm cộng đồng:", error);
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
          Cấu Hình Điểm Cộng Đồng
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
            {/* Điểm cho mỗi bài viết */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Điểm cộng cho mỗi bài viết
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {pointPerThread} điểm
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={pointPerThread}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setPointPerThread(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            {/* Điểm cho mỗi bình luận */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Điểm cộng cho mỗi bình luận
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {pointPerComment} điểm
                </Typography>
              ) : (
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={pointPerComment}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setPointPerComment(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            {/* Tỷ lệ thưởng check-in */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Tỷ lệ điểm thưởng khi check-in (% giá bàn)
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {percentCheckinReward}%
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={percentCheckinReward}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setPercentCheckinReward(Number(e.target.value));
                    }
                  }}
                />
              )}
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2">
                Số người trong top nhận được danh hiệu Top Contributor
              </Typography>
              {!isEditing ? (
                <Typography className="text-lg font-semibold">
                  {numberOfTopContributor} người
                </Typography>
              ) : (
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={numberOfTopContributor}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      setNumberOfTopContributor(Number(e.target.value));
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
                    setPointPerThread(
                      systemConfigData?.contributionPoints_PerThread ?? 0,
                    );
                    setPointPerComment(
                      systemConfigData?.contributionPoints_PerComment ?? 0,
                    );
                    setPercentCheckinReward(
                      (systemConfigData?.userPoints_PerCheckinTable_ByPercentageOfTablesPrice ??
                        0) * 100,
                    ); // đổi thành % cho dễ nhập
                    setNumberOfTopContributor(
                      systemConfigData?.numberof_TopContributors_PerWeek ?? 0,
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
