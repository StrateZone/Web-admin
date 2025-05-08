import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import axios from "axios";
import { config } from "../../../config";
import OpenCloseConfig from "../open_close_config/open_close_config";
import CancelPolicyConfig from "../cancel_policy_config/cancel_policy_config";
import ConfigCommunityPoint from "../config_community_point/config_community_point";
import ProfanitiesManagement from "../profanities_management/profanities_management";
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
  appointmentRequest_MaxHours_UntilExpiration: number;
  appointmentRequest_MinHours_UntilExpiration: number;
  max_NumberOfUsers_InvitedToTable: number;
  percentageRefund_IfNot100: number;
  percentageTimeRange_UntilRequestExpiration: number;
  status: string; //status
};

export default function System() {
  const [systemConfigData, setSystemConfigData] = useState<SystemConfig | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const backendApi = config.BACKEND_API;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get<SystemConfig>(
        `${backendApi}/system/1`,
      );
      setSystemConfigData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu hệ thống:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400">
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-8 p-6 flex justify-between items-center"
      >
        <Typography variant="h4" color="white">
          Hệ Thống
        </Typography>
      </CardHeader>
      <div className="flex-grow flex flex-col gap-6">
        <OpenCloseConfig
          systemConfigData={systemConfigData}
          isLoading={isLoading}
        />
        <CancelPolicyConfig
          systemConfigData={systemConfigData}
          isLoading={isLoading}
        />
        <ConfigCommunityPoint
          systemConfigData={systemConfigData}
          isLoading={isLoading}
        />
        <ProfanitiesManagement />
      </div>
    </div>
  );
}
