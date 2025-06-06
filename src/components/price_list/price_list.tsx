import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
  List,
  ListItem,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { config } from "../../../config";
import axiosInstance from "@/utils/axiosInstance";

const gameTypeNames: { [key: number]: string } = {
  1: "Cờ vua",
  2: "Cờ tướng",
  3: "Cờ vây",
};

const roomTypeNames: { [key: number]: string } = {
  1: "Phòng cao cấp",
  2: "Phòng thường",
  3: "Phòng không gian mở",
};

const ServicePricesList = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [newPrice, setNewPrice] = useState<number | string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gameTypes, setGameTypes] = useState<{ [key: number]: string }>({});
  const [roomTypes, setRoomTypes] = useState<{ [key: number]: string }>({});

  const backendApi = config.BACKEND_API;

  useEffect(() => {
    const fetchTypeMappings = async () => {
      try {
        const [gameTypeRes, roomTypeRes] = await Promise.all([
          axiosInstance.get(`${backendApi}/game_types/all-admin`),
          axiosInstance.get<string[]>(`${backendApi}/rooms/roomtypes`),
        ]);

        const gameTypeMap: { [key: number]: string } = {};
        gameTypeRes.data.forEach((item: any) => {
          gameTypeMap[item.typeId] = item.typeName;
        });

        const roomTypeMap: { [key: number]: string } = {};
        roomTypeRes.data.forEach((name: string, idx: number) => {
          roomTypeMap[idx + 1] = name;
        });

        setGameTypes(gameTypeMap);
        setRoomTypes(roomTypeMap);
      } catch (err) {
        console.error("Lỗi khi tải game types / room types:", err);
      }
    };

    fetchTypeMappings();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(
          `${backendApi}/prices/services`,
          {
            params: {
              "page-number": 1,
              "page-size": 10,
            },
          },
        );
        setServices(response.data.pagedList);
      } catch (err: any) {
        setError("Lỗi khi tải danh sách giá dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const formatServiceName = (service: any) => {
    if (service.memberFee) return "Phí hội viên";
    if (service.gameTypeId !== null)
      return gameTypes[service.gameTypeId] || "Dịch vụ khác";
    if (service.roomType !== null) return service.roomType || "Phòng khác";
    if (service.teachingSalary) return "Lương giảng dạy";
    return "Dịch vụ khác";
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " VNĐ";
  };

  const handlePriceChange = async () => {
    if (selectedService && newPrice !== "") {
      setIsSaving(true);
      try {
        await axiosInstance.put(`${backendApi}/prices/${selectedService.id}`, {
          price1: newPrice,
          unit: selectedService.unit,
          type: selectedService.type,
        });
        const updatedServices = services.map((service) =>
          service.id === selectedService.id
            ? { ...service, price1: newPrice }
            : service,
        );
        setServices(updatedServices);
        setOpenDialog(false);
        setSelectedService(null);
        setNewPrice("");
      } catch (err) {
        setError("Lỗi khi cập nhật giá.");
      } finally {
        setIsSaving(false); // Quan trọng! phải bật lại khi xong
      }
    }
  };

  // Tách các nhóm
  const gameServices = services.filter(
    (service) => service.gameTypeId !== null && !service.memberFee,
  );
  const roomServices = services.filter(
    (service) =>
      service.roomType !== null &&
      !service.memberFee &&
      service.gameTypeId === null,
  );
  const membershipServices = services.filter((service) => service.memberFee);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">Đang tải dữ liệu...</div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto p-6 mt-6 shadow-md">
        <Typography variant="h5" color="blue-gray" className="mb-6">
          Bảng giá dịch vụ
        </Typography>

        <CardBody className="p-0 space-y-6">
          {/* Giá cờ */}
          {gameServices.length > 0 && (
            <div>
              <Typography variant="h6" color="blue">
                Giá cờ
              </Typography>
              <List>
                {gameServices.map((service) => (
                  <ListItem
                    key={service.id}
                    className="flex justify-between items-center"
                  >
                    <Typography variant="h6" color="blue-gray">
                      {formatServiceName(service)}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {formatPrice(service.price1)} /{" "}
                      {service.unit === "per hour" ? "giờ" : "tháng"}
                    </Typography>
                    <Button
                      color="blue"
                      onClick={() => {
                        setSelectedService(service);
                        setNewPrice(service.price1);
                        setOpenDialog(true);
                      }}
                    >
                      Điều chỉnh
                    </Button>
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          {/* Giá phòng */}
          {roomServices.length > 0 && (
            <div>
              <Typography variant="h6" color="blue">
                Giá phòng
              </Typography>
              <List>
                {roomServices.map((service) => (
                  <ListItem
                    key={service.id}
                    className="flex justify-between items-center"
                  >
                    <Typography variant="h6" color="blue-gray">
                      {formatServiceName(service)}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {formatPrice(service.price1)} /{" "}
                      {service.unit === "per hour" ? "giờ" : "tháng"}
                    </Typography>
                    <Button
                      color="blue"
                      onClick={() => {
                        setSelectedService(service);
                        setNewPrice(service.price1);
                        setOpenDialog(true);
                      }}
                    >
                      Điều chỉnh
                    </Button>
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          {/* Giá membership */}
          {membershipServices.length > 0 && (
            <div>
              <Typography variant="h6" color="blue">
                Giá Membership
              </Typography>
              <List>
                {membershipServices.map((service) => (
                  <ListItem
                    key={service.id}
                    className="flex justify-between items-center"
                  >
                    <Typography variant="h6" color="blue-gray">
                      {formatServiceName(service)}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {formatPrice(service.price1)} /{" "}
                      {service.unit === "per hour" ? "giờ" : "tháng"}
                    </Typography>
                    <Button
                      color="blue"
                      onClick={() => {
                        setSelectedService(service);
                        setNewPrice(service.price1);
                        setOpenDialog(true);
                      }}
                    >
                      Điều chỉnh
                    </Button>
                  </ListItem>
                ))}
              </List>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
        <DialogHeader>Chỉnh sửa giá dịch vụ</DialogHeader>
        <DialogBody divider>
          <div className="flex flex-col space-y-4">
            <label className="text-sm text-gray-600">Nhập giá mới:</label>
            <Input
              type="number"
              value={newPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 || e.target.value === "") {
                  setNewPrice(value);
                }
              }}
              className="border p-2 rounded"
              placeholder="Nhập giá"
              crossOrigin=""
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button color="green" onClick={handlePriceChange} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
          <Button
            color="red"
            onClick={() => setOpenDialog(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default ServicePricesList;
