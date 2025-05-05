import { useEffect, useState } from "react";
import { config } from "../../../config";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";

function AddRoomPopup({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const backendApi = config.BACKEND_API;
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    roomName: "",
    type: "",
    description: "",
    capacity: 0,
    status: "available",
  });

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await axios.get(`${backendApi}/rooms/roomtypes`);
        setRoomTypes(res.data);
      } catch (err) {
        console.error("Không thể tải danh sách loại phòng:", err);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "capacity") {
        const num = Number(value);
        return { ...prev, capacity: num >= 0 ? num : 0 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${backendApi}/rooms`, formData);
      onSuccess(); // Refresh list
      onClose(); // Close popup
    } catch (err) {
      console.error("Lỗi khi thêm phòng:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <Typography variant="h6" className="mb-4 text-black">
          Thêm phòng mới
        </Typography>
        <div className="space-y-4">
          <input
            name="roomName"
            placeholder="Tên phòng"
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
          />
          <select
            name="type"
            onChange={handleChange}
            className="w-full p-2 border rounded  text-black"
          >
            <option value="">-- Chọn loại phòng --</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            name="description"
            placeholder="Mô tả"
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
          />
          <input
            name="capacity"
            type="number"
            min="0"
            placeholder="Sức chứa"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full p-2 border rounded text-black"
          />
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="text">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="blue">
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
}
export default AddRoomPopup;
