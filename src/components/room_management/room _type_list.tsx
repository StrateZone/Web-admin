import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import { config } from "../../../config";
import AddRoomTypeForm from "./add_room_type_form";

const RoomTypeList: React.FC = () => {
  const backendApi = config.BACKEND_API;
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState(false);

  const fetchRoomTypes = async () => {
    try {
      const res = await axios.get<string[]>(`${backendApi}/rooms/roomtypes`);
      setRoomTypes(res.data);
    } catch (error) {
      console.error("Lỗi khi tải room types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  return (
    <>
      <Card className="w-full max-w-md mx-auto p-6 mt-6 shadow-md">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" color="blue-gray">
              Các loại phòng trong hệ thống
            </Typography>
            <Button onClick={() => setOpenForm(true)} size="sm" color="blue">
              + Thêm
            </Button>
          </div>

          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <>
              <Typography className="mb-2 text-sm text-gray-600">
                Danh sách loại phòng:
              </Typography>
              <div className="flex flex-wrap gap-2">
                {roomTypes.map((type, index) => (
                  <Chip
                    key={index}
                    value={type}
                    className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-900 normal-case"
                  />
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>
      <AddRoomTypeForm
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchRoomTypes}
      />
    </>
  );
};

export default RoomTypeList;
