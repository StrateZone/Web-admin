import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { DefaultPagination } from "../pagination/pagination";
import ConfirmPopup from "../confirm_popup/confirm_popup";
import { color } from "@material-tailwind/react/types/components/alert";

export default function Appointments() {
  type AppointmentData = {
    appointmentId: number;
    user: { username: string; fullName?: string; email?: string };
    totalPrice: number;
    status: string;
    createdAt: string;
  };

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appointmentStatus, setAppointmentStatus] = useState<string>("");

  const handleStatusChange = (value: string | undefined) => {
    setAppointmentStatus(value ?? "");
  };

  // Fetch danh sách lịch hẹn
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://backend-production-5bc5.up.railway.app/api/appointments/all/admin",
        {
          params: {
            "page-number": currentPage,
            "page-size": 10,
            ...(appointmentStatus && { Status: appointmentStatus }),
          },
        },
      );
      console.log(
        `Fetching: https://backend-production-5bc5.up.railway.app/api/appointments/all/admin?page-number=${currentPage}&page-size=10${
          appointmentStatus ? `&appointmentStatus=${appointmentStatus}` : ""
        }`,
      );
      setAppointments(response.data.pagedList);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError("Lỗi khi tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching appointments...");
    fetchAppointments();
  }, [currentPage, appointmentStatus]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  // Mở popup xác nhận hủy
  const handleCancelClick = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setShowPopup(true);
  };

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // Xác nhận hủy lịch hẹn
  const handleConfirmCancel = async () => {
    if (!selectedAppointmentId) return;

    try {
      await axios.put(
        `https://backend-production-5bc5.up.railway.app/api/appointments/cancel/admin?appointmentId=${selectedAppointmentId}`,
      );

      setShowPopup(false);
      setSelectedAppointmentId(null);
      setShowSuccessPopup(true);

      // Gọi lại API để làm mới danh sách
      fetchAppointments();
    } catch (error) {
      console.error("Lỗi hủy lịch:", error);
      alert("Hủy lịch hẹn thất bại!");
    }
  };

  const statusColors: Record<string, string> = {
    pending: "yellow",
    confirmed: "green",
    checked_in: "teal",
    completed: "blue",
    cancelled: "red",
    unpaid: "gray",
    expired: "purple",
    refunded: "orange",
  };

  return (
    <div className="flex flex-col items-center w-full pt-12 bg-gray-400">
      <Card className="w-full max-w-6xl">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Danh sách Lịch Hẹn
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2 max-h-[70vh] min-h-[350px] overflow-y-auto">
          <div className="w-72 p-4">
            <Select
              label="Lọc trạng thái"
              onChange={handleStatusChange}
              value={appointmentStatus}
            >
              <Option value="">Tất cả trạng thái</Option>
              <Option value="pending">Đang chờ</Option>
              <Option value="confirmed">Đã đặt</Option>
              <Option value="checked_in">Đã nhận bàn</Option>
              <Option value="completed">Đã hoàn tất</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="unpaid">Chưa thanh toán</Option>
              <Option value="expired">Hết hạn</Option>
              <Option value="refunded">Đã hoàn tiền</Option>
            </Select>
          </div>
          <table className="w-full min-w-full table-auto max-h-[500px] overflow-auto">
            <thead>
              <tr>
                {[
                  "ID",
                  "Người Đặt",
                  "Tổng Giá",
                  "Trạng Thái",
                  "Đặt lúc",
                  "Hành động",
                ].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, key) => {
                const className = `py-3 px-5 ${
                  key === appointments.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={appointment.appointmentId}>
                    <td className={className}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {appointment.appointmentId}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {appointment.user.username}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {appointment.user.fullName ?? ""}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        {appointment.user.email ?? ""}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {appointment.totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={
                          (statusColors[appointment.status] as color) ||
                          "blue-gray"
                        }
                        value={appointment.status}
                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                      />
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {new Date(appointment.createdAt).toLocaleString()}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Button
                        variant="gradient"
                        color="red"
                        onClick={() =>
                          handleCancelClick(appointment.appointmentId)
                        }
                        disabled={
                          !["pending", "confirmed"].includes(appointment.status)
                        }
                      >
                        Hủy
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
        <div className="flex justify-center mt-4">
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Popup xác nhận hủy */}
        <ConfirmPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onConfirm={handleConfirmCancel}
          title="Xác nhận hủy lịch hẹn"
          message="Bạn có chắc chắn muốn hủy lịch hẹn này không?"
          confirmText="Đồng ý"
        />

        {/* popup hủy thành công */}
        <ConfirmPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          onConfirm={() => setShowSuccessPopup(false)}
          title="Hủy lịch hẹn thành công"
          message="Lịch hẹn của bạn đã được hủy thành công."
          confirmText="OK"
        />
      </Card>
    </div>
  );
}
