import axios from "axios";
import { useState, useEffect } from "react";
import { config } from "../../../config";
import axiosInstance from "@/utils/axiosInstance";
import ConfirmPopup from "../confirm_popup/confirm_popup";

interface Table {
  tableId: number;
  roomId: number;
  gameTypeId: number;
  status: string;
}

interface Room {
  roomId: number;
  roomName: string;
  type: string;
  description: string;
  capacity: number;
  status: string;
  price: number;
  unit: string;
  isForMonthlyBooking: boolean;
  tables: Table[];
}

interface GameType {
  typeId: number;
  typeName: string;
}

interface RoomDetailProps {
  roomId: number;
  onBack: () => void;
}

export default function RoomDetail({ roomId, onBack }: RoomDetailProps) {
  const backendApi = config.BACKEND_API;
  const [room, setRoom] = useState<Room | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [selectedGameTypeId, setSelectedGameTypeId] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"disable" | "enable" | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    roomName: "",
    type: "",
    description: "",
    capacity: 0,
    status: "available",
    isForMonthlyBooking: false,
  });

  useEffect(() => {
    if (room) {
      setEditForm({
        roomName: room.roomName,
        type: room.type,
        description: room.description,
        capacity: room.capacity,
        status: room.status,
        isForMonthlyBooking: room.isForMonthlyBooking,
      });
    }
  }, [room]);

  const [loading, setLoading] = useState(true);

  // const gameTypeTranslations: Record<string, string> = {
  //   chess: "Cờ vua",
  //   xiangqi: "Cờ tướng",
  //   go: "Cờ vây",
  // };

  // Hàm lấy màu sắc của trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "has_room":
        return "bg-yellow-500";
      case "out_of_service":
        return "bg-red-500";
      case "available":
        return "bg-green-500";
      case "unavailable":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Hàm lấy label tiếng Việt cho trạng thái
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "has_room":
        return "Có phòng";
      case "out_of_service":
        return "Ngưng hoạt động";
      case "available":
        return "Đang hoạt động";
      case "unavailable":
        return "Ngưng hoạt động";
      default:
        return "Không xác định";
    }
  };

  const fetchRoomDetail = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${backendApi}/rooms/${roomId}`);
      setRoom(res.data);
      setTables(res.data.tables || []);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch room detail
  useEffect(() => {
    fetchRoomDetail();
  }, [backendApi, roomId]);

  // Fetch game types
  useEffect(() => {
    const fetchGameTypes = async () => {
      try {
        const res = await axiosInstance.get(`${backendApi}/game_types/all`);
        setGameTypes(
          res.data.map((type: any) => ({
            typeId: type.typeId,
            typeName: type.typeName,
          })),
        );
        if (res.data.length > 0) {
          setSelectedGameTypeId(res.data[0].typeId);
        }
      } catch (error) {
        console.error("Lỗi khi tải game types:", error);
      }
    };

    fetchGameTypes();
  }, [backendApi]);

  const handleAddTable = async () => {
    if (!room) return;
    if (!selectedGameTypeId) {
      alert("Vui lòng chọn loại game.");
      return;
    }
    setCreating(true);
    try {
      const res = await axiosInstance.post(`${backendApi}/tables`, {
        room_Id: room.roomId,
        gameType_Id: selectedGameTypeId,
      });

      const newTable: Table = res.data;
      setTables((prev) => [...prev, newTable]);
      setShowCreateForm(false); // Đóng form sau khi thêm
    } catch (error) {
      console.error("Lỗi khi thêm bàn mới:", error);
      alert("Thêm bàn thất bại!");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!room) return;
    try {
      await axiosInstance.put(`${backendApi}/rooms/${room.roomId}`, {
        roomId: room.roomId,
        ...editForm,
      });
      setEditing(false);
      fetchRoomDetail();
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng:", error);
      alert("Cập nhật thất bại!");
    }
  };

  const openConfirmPopup = (tableId: number, type: "disable" | "enable") => {
    setSelectedTableId(tableId);
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (selectedTableId === null || actionType === null) return;

    const url =
      actionType === "disable"
        ? `${backendApi}/tables/disable/${selectedTableId}`
        : `${backendApi}/tables/enable/${selectedTableId}`;

    try {
      await axiosInstance.put(url);
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.tableId === selectedTableId
            ? {
                ...table,
                status: actionType === "disable" ? "out_of_service" : "active",
              }
            : table,
        ),
      );
    } catch (error) {
      console.error(`Lỗi khi ${actionType} bàn:`, error);
      alert(`Không thể ${actionType === "disable" ? "ngưng" : "bật"} bàn.`);
    } finally {
      setConfirmOpen(false);
      setSelectedTableId(null);
      setActionType(null);
    }
  };

  const handleRoomStatusChange = async (action: "enable" | "disable") => {
    if (!room) return;
    const url = `${backendApi}/rooms/${action}/${room.roomId}`;
    try {
      await axiosInstance.put(url);
      fetchRoomDetail(); // Refresh lại sau khi thay đổi trạng thái
    } catch (error) {
      console.error(`Lỗi khi ${action} phòng:`, error);
      alert(`Không thể ${action === "disable" ? "ngưng" : "kích hoạt"} phòng.`);
    }
  };

  const getGameTypeName = (gameTypeId: number) => {
    const gameType = gameTypes.find((type) => type.typeId === gameTypeId);
    if (gameType) {
      const gameTypeName = gameType.typeName || gameType.typeName; // Dịch tên loại game
      return gameTypeName;
    }
    return "Chưa có loại game";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] p-4">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center text-red-500">Không tìm thấy phòng.</div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <button onClick={onBack} className="text-blue-600 hover:underline mb-4">
        ← Quay lại danh sách
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{room.roomName}</h1>
          <p className="text-lg text-gray-600 mt-2 whitespace-pre-line">
            Phòng {room.type}
          </p>
          <p
            className={`text-sm font-medium inline-block px-3 py-1 rounded-full text-white ${getStatusColor(room.status)}`}
          >
            Trạng thái: {getStatusLabel(room.status)}
          </p>

          <p className="text-lg text-gray-600 mt-2 whitespace-pre-line">
            {room.description}
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Số bàn: {tables.length}/{room.capacity}
            </p>
          </div>
          {editing ? (
            <div className="space-y-3">
              <input
                className="border p-2 rounded w-full"
                placeholder="Tên phòng"
                value={editForm.roomName}
                onChange={(e) =>
                  setEditForm({ ...editForm, roomName: e.target.value })
                }
              />
              <textarea
                className="border p-2 rounded w-full"
                placeholder="Mô tả"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
              <input
                type="number"
                className="border p-2 rounded w-full"
                placeholder="Sức chứa"
                value={editForm.capacity}
                onChange={(e) =>
                  setEditForm({ ...editForm, capacity: Number(e.target.value) })
                }
              />
              <div className="flex gap-4">
                <button
                  onClick={handleUpdateRoom}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="mt-4 px-4 py-2 bg-yellow-800 text-white rounded hover:bg-yellow-900"
            >
              Chỉnh sửa thông tin phòng
            </button>
          )}
          <div className="mt-4 flex gap-4">
            {room.status === "unavailable" ? (
              <button
                onClick={() => handleRoomStatusChange("enable")}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Kích hoạt phòng
              </button>
            ) : (
              <button
                onClick={() => handleRoomStatusChange("disable")}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Ngưng hoạt động phòng
              </button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Danh sách bàn
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Thêm bàn
            </button>
          </div>

          {showCreateForm && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <select
                  value={selectedGameTypeId}
                  onChange={(e) =>
                    setSelectedGameTypeId(Number(e.target.value))
                  }
                  className="border rounded-md p-2"
                >
                  {gameTypes.map((type) => (
                    <option key={type.typeId} value={type.typeId}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddTable}
                  disabled={creating || tables.length >= room.capacity}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </div>
          )}

          <ul className="mt-4 space-y-3">
            {tables.map((table) => (
              <li
                key={table.tableId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
              >
                <span className="text-gray-700">Bàn {table.tableId}</span>
                <span className="text-gray-700">
                  {getGameTypeName(table.gameTypeId)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs text-white rounded-full ${getStatusColor(
                    table.status,
                  )}`}
                >
                  {getStatusLabel(table.status)}
                </span>
                {table.status === "out_of_service" ? (
                  <button
                    onClick={() => openConfirmPopup(table.tableId, "enable")}
                    className="mt-2 md:mt-0 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Bật lại
                  </button>
                ) : (
                  <button
                    onClick={() => openConfirmPopup(table.tableId, "disable")}
                    className="mt-2 md:mt-0 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Ngưng hoạt động
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          actionType === "disable"
            ? "Xác nhận ngưng hoạt động bàn"
            : "Xác nhận bật lại bàn"
        }
        message={
          actionType === "disable"
            ? `Bạn có chắc chắn muốn ngưng hoạt động bàn này?\nCác đơn của bàn này trong tương lại sẽ được hoàn tiền 100% cho khách hàng`
            : "Bạn có chắc chắn muốn bật lại bàn này để sử dụng?"
        }
        confirmText={actionType === "disable" ? "Ngưng hoạt động" : "Bật lại"}
      />
    </div>
  );
}
