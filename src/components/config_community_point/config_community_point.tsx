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

export type SystemConfig = {
  id: number;
  adminId: number;
  openTime: string;
  closeTime: string;
  appointment_Refund100_HoursFromScheduleTime: number;
  appointment_Incoming_HoursFromScheduleTime: number;
  appointment_Checkin_MinutesFromScheduleTime: number;
  max_NumberOfTables_CancelPerWeek: number;
  contributionPoints_PerThread: number;
  contributionPoints_PerComment: number;
  userPoints_PerCheckinTable_ByPercentageOfTablesPrice: number;
  status: string;
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
    }
  }, [systemConfigData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${backendApi}/system/1/points-rules`, {
        contributionPoints_PerThread: pointPerThread,
        contributionPoints_PerComment: pointPerComment,
        userPoints_By_TablePricePercentage: percentCheckinReward / 100, // đổi về dạng 0.002
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
                  onChange={(e) => setPointPerThread(Number(e.target.value))}
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
                  onChange={(e) => setPointPerComment(Number(e.target.value))}
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
                  onChange={(e) =>
                    setPercentCheckinReward(Number(e.target.value))
                  }
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
