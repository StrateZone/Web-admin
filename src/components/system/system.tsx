import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import { AiOutlineEdit } from "react-icons/ai"; // Biểu tượng bút
import axios from "axios";
import { config } from "../../../config";

export default function System() {
  const [openTime, setOpenTime] = useState<string>("");
  const [closeTime, setCloseTime] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const backendApi = config.BACKEND_API;

  const [isEditing, setIsEditing] = useState<boolean>(false); // Trạng thái chỉnh sửa

  useEffect(() => {
    axios
      .get(`${backendApi}/system/1`)
      .then((res) => {
        const { openTime, closeTime, status } = res.data;
        setOpenTime(openTime.slice(0, 5)); // Cắt bỏ giây, giữ "hh:mm"
        setCloseTime(closeTime.slice(0, 5));
        setStatus(status);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu hệ thống:", err);
      });
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${backendApi}/system/working-hour/1`, {
        openHour: openTime + ":00", // thêm giây
        closeHour: closeTime + ":00", // thêm giây
      });

      console.log("Cập nhật thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật giờ hoạt động:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400">
      <div className="flex-grow flex flex-col">
        <Card className="w-full max-w-3xl mx-auto px-6 py-4">
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-6 flex justify-between items-center"
          >
            <Typography variant="h6" color="white">
              Hệ Thống
            </Typography>
            {!isEditing && (
              <AiOutlineEdit
                className="cursor-pointer text-white"
                size={20}
                onClick={() => setIsEditing(true)} // Kích hoạt chế độ chỉnh sửa
              />
            )}
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
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
                  <Button color="green" onClick={handleSave}>
                    Lưu thay đổi
                  </Button>
                  <Button color="red" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
