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
import React, { useEffect, useRef, useState } from "react";
import { DefaultPagination } from "../pagination/pagination";
import ConfirmPopup from "../confirm_popup/confirm_popup";
import { color } from "@material-tailwind/react/types/components/alert";
import { GoArrowDownRight, GoArrowUpRight } from "react-icons/go";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { config } from "../../../config";

export default function Appointments() {
  type AppointmentData = {
    appointmentId: number;
    user: {
      userId: number;
      username: string;
      fullName?: string;
      email?: string;
    };
    totalPrice: number;
    status: string;
    createdAt: string;
    tablesAppointments: Array<{
      id: number;
      tableId: number;
      status: string;
      scheduleTime: string;
      endTime: string;
      durationInHours: number;
      price: number;
      table: {
        tableId: number;
        roomName: string;
        roomType: string;
        roomDescription: string;
      };
    }>;
  };

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appointmentStatus, setAppointmentStatus] = useState<string>("");
  const [orderBy, setOrderBy] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const backendApi = config.BACKEND_API;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500); // Đợi 500ms sau khi người dùng dừng gõ

    return () => {
      clearTimeout(handler); // Xoá timeout nếu người dùng tiếp tục gõ
    };
  }, [searchValue]);

  const handleSearchChange = (value: string | undefined) => {
    setSearchValue(value ?? "");
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const toggleRow = (appointmentId: number) => {
    setExpandedRows((prev) =>
      prev.includes(appointmentId)
        ? prev.filter((id) => id !== appointmentId)
        : [...prev, appointmentId],
    );
  };

  const handleOrderByChange = (value: string | undefined) => {
    setOrderBy(value ?? "");
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const handleStatusChange = (value: string | undefined) => {
    setAppointmentStatus(value ?? "");
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  let latestRequestId = 0;

  const fetchAppointments = async () => {
    // Tăng requestId mới
    const requestId = ++latestRequestId;

    // Hủy request cũ nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Tạo controller mới cho request này
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const response = await axios.get(`${backendApi}/appointments/all/admin`, {
        signal: controller.signal,
        params: {
          "page-number": currentPage,
          "page-size": 10,
          ...(appointmentStatus && { Status: appointmentStatus }),
          ...(orderBy && { "order-by": orderBy }),
          ...(debouncedSearchValue && {
            SearchValue: encodeURIComponent(debouncedSearchValue),
          }),
        },
      });

      // Chỉ xử lý nếu là request mới nhất
      if (requestId === latestRequestId) {
        setAppointments(response.data.pagedList);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
      } else if (requestId === latestRequestId) {
        setError("Lỗi khi tải danh sách lịch hẹn.");
      }
    } finally {
      if (requestId === latestRequestId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    //console.log("Fetching appointments...");
    fetchAppointments();
  }, [currentPage, appointmentStatus, orderBy, debouncedSearchValue]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedTableAppointmentId, setSelectedTableAppointmentId] = useState<
    number | null
  >(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedTableInfo, setSelectedTableInfo] = useState<{
    roomName: string;
    roomType: string;
    scheduleTime: string;
    endTime: string;
    date: string;
    price: number;
  } | null>(null);

  // Mở popup xác nhận hủy
  const handleCancelClick = (
    tableAppointmentId: number,
    userId: number,
    tableInfo: {
      roomName: string;
      roomType: string;
      scheduleTime: string;
      endTime: string;
      date: string;
      price: number;
    },
  ) => {
    setSelectedTableAppointmentId(tableAppointmentId);
    setSelectedUserId(userId);
    setSelectedTableInfo(tableInfo);
    setShowPopup(true);
  };

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // Xác nhận hủy lịch hẹn
  const handleConfirmCancel = async () => {
    if (!selectedTableAppointmentId || !selectedUserId) return;

    try {
      await axios.put(
        `${backendApi}/appointments/cancel/admin?tableAppointmentId=${selectedTableAppointmentId}&userId=${selectedUserId}`,
      );

      setShowPopup(false);
      setSelectedTableAppointmentId(null);
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
    incompleted: "darkgray",
    incoming: "indigo",
  };

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400">
      <div className="flex-grow flex flex-col">
        <Card className="px-4 w-full max-w-[95vw] min-w-[320px] mx-auto">
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              Danh sách Lịch Hẹn
            </Typography>
          </CardHeader>
          <CardBody className="px-4 pt-0 pb-2 max-h-[70vh] min-h-[500px] overflow-y-auto">
            <div className="flex gap-4 p-4">
              <div className="flex-shrink-0">
                <Select
                  label="Lọc trạng thái"
                  onChange={handleStatusChange}
                  value={appointmentStatus}
                  className="min-w-[170px]"
                >
                  <Option value="">Tất cả trạng thái</Option>
                  <Option value="pending">Đang chờ</Option>
                  <Option value="confirmed">Đã đặt</Option>
                  <Option value="incoming">Sắp diễn ra</Option>
                  <Option value="checked_in">Đã nhận bàn</Option>
                  <Option value="cancelled">Đã hủy</Option>
                  <Option value="unpaid">Chưa thanh toán</Option>
                  <Option value="expired">Hết hạn</Option>
                  <Option value="refunded">Đã hoàn tiền</Option>
                </Select>
              </div>

              <div className="flex-shrink-0">
                <Select
                  label="Sắp xếp"
                  onChange={handleOrderByChange}
                  value={orderBy}
                  className="min-w-[190px]"
                >
                  <Option value="">
                    <div className="flex items-center gap-1">Mặc định</div>
                  </Option>
                  <Option value="created-at">
                    <div className="flex items-center gap-1">
                      Thời gian đặt <GoArrowUpRight />
                    </div>
                  </Option>
                  <Option value="created-at-desc">
                    <div className="flex items-center gap-1">
                      Thời gian đặt <GoArrowDownRight />
                    </div>
                  </Option>
                  <Option value="total-price">
                    <div className="flex items-center gap-1">
                      Giá tiền <GoArrowUpRight />
                    </div>
                  </Option>
                  <Option value="total-price-desc">
                    <div className="flex items-center gap-1">
                      Giá tiền <GoArrowDownRight />
                    </div>
                  </Option>
                  <Option value="tables-count">
                    <div className="flex items-center gap-1">
                      Số bàn <GoArrowUpRight />
                    </div>
                  </Option>
                  <Option value="tables-count-desc">
                    <div className="flex items-center gap-1">
                      Số bàn <GoArrowDownRight />
                    </div>
                  </Option>
                </Select>
              </div>
              <div className="flex-1 min-w-[250px]">
                <div className="w-full max-w-lg min-w-[200px]">
                  <div className="relative">
                    <input
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full bg-white text-black placeholder:text-gray-500 text-sm border border-gray-300 rounded-md pl-3 pr-28 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-gray-500 hover:border-gray-400 shadow-sm"
                      placeholder="Tìm bằng ID của đơn hoặc Email người dùng"
                    />
                    <button
                      className="absolute top-1 right-1 flex items-center rounded bg-gray-800 text-white py-1 px-3 border border-transparent text-sm transition-all shadow-sm hover:bg-gray-700 active:bg-gray-900"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 mr-1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
              </div>
            ) : !appointments || appointments.length === 0 ? (
              <div className="text-center py-4 text-blue-gray-500">
                Không tìm thấy cuộc hẹn nào.
              </div>
            ) : (
              appointments.map((appointment) => {
                const isExpanded = expandedRows.includes(
                  appointment.appointmentId,
                );

                return (
                  <Card key={appointment.appointmentId} className="mb-4 shadow">
                    <CardBody>
                      {/* Header chính của appointment */}
                      <div className="flex flex-col gap-2">
                        <div
                          className="flex items-start justify-between cursor-pointer hover:bg-gray-50 rounded-md p-2"
                          onClick={() => toggleRow(appointment.appointmentId)}
                        >
                          <div className="flex gap-4 items-start">
                            <span className="text-lg mt-1">
                              {isExpanded ? (
                                <FiChevronDown />
                              ) : (
                                <FiChevronRight />
                              )}
                            </span>
                            <div>
                              <Typography variant="small" className="font-bold">
                                ID: {appointment.appointmentId}
                              </Typography>
                              <Typography className="text-sm text-blue-gray-600">
                                {appointment.user.fullName} (
                                {appointment.user.username})
                              </Typography>
                              <Typography className="text-xs text-blue-gray-400">
                                {appointment.user.email}
                              </Typography>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <Typography className="text-sm font-semibold text-blue-gray-700">
                              {appointment.totalPrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </Typography>
                            <Chip
                              variant="gradient"
                              color={
                                (statusColors[appointment.status] as color) ||
                                "gray"
                              }
                              value={appointment.status}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                            <Typography className="text-xs text-blue-gray-400">
                              {new Date(appointment.createdAt).toLocaleString(
                                "vi-VN",
                              )}
                            </Typography>
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết nếu mở rộng */}
                      {isExpanded && (
                        <div className="mt-4 pl-6">
                          <Typography
                            variant="small"
                            className="font-semibold mb-2"
                          >
                            Các bàn đã đặt:
                          </Typography>
                          {appointment.tablesAppointments?.length === 0 ? (
                            <Typography className="text-sm text-blue-gray-500 italic">
                              Không có bàn nào cho cuộc hẹn này.
                            </Typography>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left border">
                                <thead className="bg-blue-gray-50 text-gray-700">
                                  <tr>
                                    <th className="py-1 px-2">Phòng</th>
                                    <th className="py-1 px-2">Loại Phòng</th>
                                    <th className="py-1 px-2">Giờ bắt đầu</th>
                                    <th className="py-1 px-2">Giờ kết thúc</th>
                                    <th className="py-1 px-2">Ngày</th>
                                    <th className="py-1 px-2">Giá</th>
                                    <th className="py-1 px-2">Trạng thái</th>
                                    <th className="py-1 px-2">Hành Động</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {appointment.tablesAppointments.map(
                                    (tableApp) => (
                                      <tr
                                        key={tableApp.id}
                                        className="border-t"
                                      >
                                        <td className="py-1 px-2">
                                          {tableApp.table.roomName}
                                        </td>
                                        <td className="py-1 px-2">
                                          {tableApp.table.roomType}
                                        </td>
                                        <td className="py-1 px-2">
                                          {new Date(
                                            tableApp.scheduleTime,
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </td>
                                        <td className="py-1 px-2">
                                          {new Date(
                                            tableApp.endTime,
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </td>
                                        <td className="py-1 px-2">
                                          {new Date(
                                            tableApp.scheduleTime,
                                          ).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="py-1 px-2">
                                          {tableApp.price.toLocaleString()} đ
                                        </td>
                                        <td className="py-1 px-2">
                                          {tableApp.status}
                                        </td>
                                        <td className="py-1 px-2">
                                          <Button
                                            variant="gradient"
                                            color="red"
                                            onClick={() =>
                                              handleCancelClick(
                                                tableApp.id,
                                                appointment.user.userId,
                                                {
                                                  roomName:
                                                    tableApp.table.roomName,
                                                  roomType:
                                                    tableApp.table.roomType,
                                                  scheduleTime: new Date(
                                                    tableApp.scheduleTime,
                                                  ).toLocaleTimeString(
                                                    "vi-VN",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  ),
                                                  endTime: new Date(
                                                    tableApp.endTime,
                                                  ).toLocaleTimeString(
                                                    "vi-VN",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  ),
                                                  date: new Date(
                                                    tableApp.scheduleTime,
                                                  ).toLocaleDateString("vi-VN"),
                                                  price: tableApp.price,
                                                },
                                              )
                                            }
                                            disabled={
                                              ![
                                                "pending",
                                                "confirmed",
                                              ].includes(tableApp.status)
                                            }
                                          >
                                            Hủy
                                          </Button>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })
            )}
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
            message={
              selectedTableInfo
                ? `Bạn có chắc chắn muốn hủy lịch hẹn:\n
                - Phòng: ${selectedTableInfo.roomName} (${selectedTableInfo.roomType})\n
                - Ngày: ${selectedTableInfo.date}\n
                - Giờ: ${selectedTableInfo.scheduleTime} - ${selectedTableInfo.endTime}\n
                - Giá: ${selectedTableInfo.price.toLocaleString()} đ`
                : "Bạn có chắc chắn muốn hủy lịch hẹn này không?"
            }
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
    </div>
    // <div className="px-4 flex flex-col items-center w-full pt-12 bg-gray-400">

    // </div>
  );
}
