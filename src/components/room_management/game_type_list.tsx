import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import ConfirmPopup from "../confirm_popup/confirm_popup";
import { config } from "../../../config";
import AddGameTypeForm from "./add_game_type_form";
import axiosInstance from "@/utils/axiosInstance";

interface GameType {
  typeId: number;
  typeName: string;
  status: string;
}

const GameTypeTable: React.FC = () => {
  const backendApi = config.BACKEND_API;
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<GameType | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "enable" | "disable" | null
  >(null);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  const fetchGameTypes = async () => {
    try {
      const res = await axiosInstance.get<GameType[]>(
        `${backendApi}/game_types/all-admin`,
      );
      setGameTypes(res.data);
    } catch (error) {
      console.error("Lỗi khi tải game types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameTypes();
  }, []);

  const handleOpenConfirm = (type: GameType) => {
    const action = type.status === "active" ? "disable" : "enable";
    setSelectedType(type);
    setConfirmAction(action);
    setPopupOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedType || !confirmAction) return;

    try {
      await axios.put(
        `${backendApi}/game_types/${confirmAction}/${selectedType.typeId}`,
      );
      setPopupOpen(false);
      setSelectedType(null);
      setConfirmAction(null);
      fetchGameTypes();
    } catch (error) {
      console.error(`Lỗi khi ${confirmAction} loại cờ:`, error);
    }
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto p-6 mt-6 shadow-md">
        <CardBody>
          <Typography variant="h4" color="blue-gray" className="mb-4">
            Danh sách loại cờ
          </Typography>
          <Button
            color="blue"
            onClick={() => setOpenAddForm(true)}
            className="mb-4"
          >
            + Thêm loại cờ
          </Button>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <table className="w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="border-b bg-blue-gray-50 p-4">#</th>
                  <th className="border-b bg-blue-gray-50 p-4">Tên loại cờ</th>
                  <th className="border-b bg-blue-gray-50 p-4">Trạng thái</th>
                  <th className="border-b bg-blue-gray-50 p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {gameTypes.map((type, index) => (
                  <tr key={type.typeId} className="even:bg-blue-gray-50/50">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{type.typeName}</td>
                    <td className="p-4">
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          type.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        } w-fit`}
                      >
                        {type.status === "active"
                          ? "Đang hoạt động"
                          : "Đang không hoạt động"}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outlined"
                        color={type.status === "active" ? "red" : "green"}
                        onClick={() => handleOpenConfirm(type)}
                      >
                        {type.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
      <AddGameTypeForm
        isOpen={openAddForm}
        onClose={() => setOpenAddForm(false)}
        onSuccess={fetchGameTypes}
      />

      <ConfirmPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === "disable"
            ? "Vô hiệu hóa loại cờ"
            : "Kích hoạt loại cờ"
        }
        message={
          selectedType
            ? `Bạn có chắc chắn muốn ${
                confirmAction === "disable"
                  ? `vô hiệu hóa loại cờ "${selectedType.typeName}" không? \n Các lịch hẹn của loại cờ này trong tương lai sẽ bị hủy và refund cho khách hàng`
                  : `kích hoạt loại cờ "${selectedType.typeName}" không?`
              } `
            : ""
        }
        confirmText="Xác nhận"
      />
    </>
  );
};

export default GameTypeTable;
