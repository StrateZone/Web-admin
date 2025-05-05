import {
  Button,
  Card,
  CardBody,
  Input,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import React, { useState } from "react";
import axios from "axios";

interface AddGameTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGameTypeForm: React.FC<AddGameTypeFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [typeName, setTypeName] = useState("");
  const [pricePerHour, setPricePerHour] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!typeName) return alert("Tên loại cờ không được để trống!");
    setLoading(true);
    try {
      await axios.post(
        "https://backend-production-ac5e.up.railway.app/api/game_types",
        {
          typeName,
          pricePerHour,
        },
      );
      onSuccess();
      onClose();
      setTypeName("");
      setPricePerHour(0);
    } catch (error) {
      alert("Đã xảy ra lỗi khi thêm loại cờ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="w-full max-w-xl px-4">
        <Card>
          <CardBody>
            <div className="justify-between items-center">
              <Typography variant="h5">Thêm loại cờ mới</Typography>
              Vui lòng thêm với dạng các chữ cái đầu của tên ghi hoa
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <Input
                label="Tên loại cờ"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                crossOrigin=""
              />
              <Input
                label="Giá mỗi giờ (VNĐ)"
                type="number"
                value={pricePerHour}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 || e.target.value === "") {
                    setPricePerHour(Number(e.target.value));
                  }
                }}
                crossOrigin=""
              />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button color="red" onClick={onClose}>
                Hủy
              </Button>
              <Button color="green" onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang thêm..." : "Thêm loại cờ"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
};

export default AddGameTypeForm;
