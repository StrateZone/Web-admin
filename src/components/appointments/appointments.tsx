import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
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
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedAppointmentId, setclickedAppointmentId] = useState<
    number | null
  >(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appointmentStatus, setAppointmentStatus] = useState<string>("");
  const [orderBy, setOrderBy] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [minutesBeforeSchedule, setMinutesBeforeSchedule] = useState<
    number | null
  >(null);
  const authData =
    typeof window !== "undefined" ? localStorage.getItem("authData") : null;
  const userRole = authData ? JSON.parse(authData)?.userRole : null;
  const isAdmin = userRole === "Admin";
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

  useEffect(() => {
    const fetchMinutesBeforeSchedule = async () => {
      try {
        const response = await axios.get(
          `${backendApi}/system/1/check-in/minutes-before-schedule`,
        );
        setMinutesBeforeSchedule(response.data); // response trả về 1 số phút
      } catch (error) {
        console.error("Lỗi khi lấy minutes-before-schedule:", error);
      }
    };

    fetchMinutesBeforeSchedule();
  }, [backendApi]);

  const handleSearchChange = (value: string | undefined) => {
    setSearchValue(value ?? "");
    setCurrentPage(1); // Reset về trang đầu tiên
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

  const fetchAppointmentDetails = async () => {
    try {
      const response = await axios.get(
        `${backendApi}/appointments/${clickedAppointmentId}`,
      );
      setAppointmentDetails(response.data);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      setError("Lỗi khi tải chi tiết lịch hẹn.");
    }
  };

  useEffect(() => {
    if (clickedAppointmentId) {
      fetchAppointmentDetails();
    }
  }, [clickedAppointmentId]);

  const handleAppointmentClick = () => {
    fetchAppointmentDetails();
  };

  const [showPopup, setShowPopup] = useState(false);
  const [selectedTableAppointmentId, setSelectedTableAppointmentId] = useState<
    number | null
  >(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedTableInfo, setSelectedTableInfo] = useState<{
    tableId: number;
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
      tableId: number;
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
  // Xác nhận hủy bàn
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
      fetchAppointmentDetails();
    } catch (error) {
      console.error("Lỗi hủy lịch:", error);
      alert("Hủy lịch hẹn thất bại!");
    }
  };

  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const handleClosePopup = () => {
    setShowDetailsPopup(false);
    setAppointmentDetails(null);
  };

  const [showCheckinPopup, setShowCheckinPopup] = useState(false);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [selectedTableAppointmentUserId, setSelectedTableAppointmentUserId] =
    useState<number | null>(null);

  // Mở popup xác nhận điểm danh
  const handleCheckinClick = (tableAppointmentId: number, userId: number) => {
    setSelectedTableAppointmentId(tableAppointmentId);
    setSelectedTableAppointmentUserId(userId);
    setShowCheckinPopup(true);
  };

  // Xác nhận điểm danh lịch hẹn
  const handleConfirmCheckin = async () => {
    if (!selectedTableAppointmentId || !selectedTableAppointmentUserId) return;

    try {
      await axios.put(
        `${backendApi}/tables-appointment/check-in/${selectedTableAppointmentId}/users/${selectedTableAppointmentUserId}`,
      );

      setShowCheckinPopup(false);
      setSelectedTableAppointmentId(null);
      setShowCheckinSuccessPopup(true);

      fetchAppointments();
      fetchAppointmentDetails();
    } catch (error) {
      console.error("Lỗi hủy lịch:", error);
      alert("Hủy lịch hẹn thất bại!");
    }
  };

  // Mở popup xác nhận hoàn tất bàn
  const handleCompleteClick = (tableAppointmentId: number, userId: number) => {
    setSelectedTableAppointmentId(tableAppointmentId);
    setSelectedTableAppointmentUserId(userId);
    setShowCheckoutPopup(true);
  };

  const handleConfirmComplete = async () => {
    if (!selectedTableAppointmentId || !selectedTableAppointmentUserId) return;

    try {
      await axios.put(
        `${backendApi}/tables-appointment/check-out/${selectedTableAppointmentId}/users/${selectedTableAppointmentUserId}`,
      );

      setShowCheckoutPopup(false);
      setSelectedTableAppointmentId(null);
      setShowCheckoutSuccessPopup(true);

      fetchAppointments();
      fetchAppointmentDetails();
    } catch (error) {
      console.error("Lỗi hoàn tất lịch:", error);
      alert("Hoàn tất lịch hẹn thất bại!");
    }
  };

  const [showCheckinSuccessPopup, setShowCheckinSuccessPopup] = useState(false);
  const [showCheckoutSuccessPopup, setShowCheckoutSuccessPopup] =
    useState(false);

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
                  {/* <Option value="pending">Đang chờ</Option> */}
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
                return (
                  <Card key={appointment.appointmentId} className="mb-4 shadow">
                    <CardBody>
                      {/* Header chính của appointment */}
                      <div className="flex flex-col gap-2">
                        <div
                          className="flex items-start justify-between cursor-pointer hover:bg-gray-50 rounded-md p-2"
                          onClick={() => {
                            setclickedAppointmentId(null); // Reset trước
                            setTimeout(() => {
                              setclickedAppointmentId(
                                appointment.appointmentId,
                              ); // Gán lại sau 1 tick
                              setShowDetailsPopup(true);
                            }, 0);
                          }}
                        >
                          <div className="flex gap-4 items-start">
                            <div>
                              <Typography variant="small" className="font-bold">
                                ID: {appointment.appointmentId}
                              </Typography>
                              <Typography className="text-sm text-blue-gray-600">
                                {appointment.user?.fullName} (
                                {appointment.user?.username})
                              </Typography>
                              <Typography className="text-xs text-blue-gray-400">
                                {appointment.user?.email}
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
                    </CardBody>
                  </Card>
                );
              })
            )}
          </CardBody>
          {appointmentDetails &&
            !showPopup &&
            !showSuccessPopup &&
            !showCheckinPopup &&
            !showCheckinSuccessPopup &&
            !showCheckoutPopup &&
            !showCheckoutSuccessPopup && (
              <Dialog
                open={showDetailsPopup}
                handler={handleClosePopup}
                className="z-10 bg-white"
              >
                <DialogHeader>
                  Chi tiết lịch hẹn {appointmentDetails.appointmentId}
                </DialogHeader>
                <DialogBody>
                  <Typography>
                    Tổng giá:{" "}
                    {appointmentDetails.totalPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Typography>
                  <Typography>
                    Trạng thái: {appointmentDetails.status}
                  </Typography>

                  <Typography className="mt-4">Các bàn:</Typography>
                  {appointmentDetails.tablesAppointments?.map((table: any) => (
                    <div key={table.id} className="mt-2 p-2 border rounded-md">
                      <Typography>Bàn số: {table.tableId}</Typography>
                      <Typography>Phòng: {table.table.roomName}</Typography>
                      <Typography>Trạng thái: {table.status}</Typography>
                      <Typography>
                        Giờ bắt đầu:{" "}
                        {new Date(table.scheduleTime).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </Typography>
                      <Typography>
                        Giờ kết thúc:{" "}
                        {new Date(table.endTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      <Typography>
                        Ngày:{" "}
                        {new Date(table.scheduleTime).toLocaleDateString(
                          "vi-VN",
                        )}
                      </Typography>
                      <Typography>
                        Giá:{" "}
                        {table.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </Typography>
                      {/* Các nút điều khiển */}
                      <div className="flex gap-3 flex-wrap">
                        {/* Nút Hủy Bàn */}
                        {isAdmin && (
                          <Button
                            variant="gradient"
                            color="red"
                            onClick={() =>
                              handleCancelClick(
                                table.id,
                                appointmentDetails.userId,
                                {
                                  tableId: table.id,
                                  roomName: table.table.roomName,
                                  roomType: table.table.roomType,
                                  scheduleTime: new Date(
                                    table.scheduleTime,
                                  ).toLocaleString("vi-VN"),
                                  endTime: new Date(
                                    table.endTime,
                                  ).toLocaleString("vi-VN"),
                                  date: new Date(
                                    table.scheduleTime,
                                  ).toLocaleDateString("vi-VN"),
                                  price: table.price,
                                },
                              )
                            }
                            disabled={
                              !["pending", "confirmed"].includes(table.status)
                            }
                          >
                            Hủy Bàn
                          </Button>
                        )}

                        {/* Nút Điểm danh / Hoàn tất */}
                        {table.status === "checked_in" ? (
                          <Button
                            variant="gradient"
                            color="green"
                            onClick={() =>
                              handleCompleteClick(
                                table.id,
                                appointmentDetails.userId,
                              )
                            }
                          >
                            Hoàn tất
                          </Button>
                        ) : (
                          <Button
                            variant="gradient"
                            color="blue"
                            onClick={() =>
                              handleCheckinClick(
                                table.id,
                                appointmentDetails.userId,
                              )
                            }
                            disabled={
                              !(
                                table.status === "incoming" &&
                                minutesBeforeSchedule !== null &&
                                new Date() >=
                                  new Date(
                                    new Date(table.scheduleTime).getTime() -
                                      minutesBeforeSchedule * 60 * 1000,
                                  )
                              )
                            }
                          >
                            Điểm danh
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </DialogBody>
                <DialogFooter>
                  <Button
                    variant="outlined"
                    color="red"
                    onClick={handleClosePopup}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </Dialog>
            )}
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
                ? `Bạn có chắc chắn muốn hủy bàn ${selectedTableInfo.tableId}:\n
                - Phòng: ${selectedTableInfo.roomName} (${selectedTableInfo.roomType})\n
                - Ngày: ${selectedTableInfo.date}\n
                - Giờ: ${selectedTableInfo.scheduleTime} - ${selectedTableInfo.endTime}\n
                - Giá: ${selectedTableInfo.price.toLocaleString()} đ\n
                Các người chơi của bàn này sẽ được hoàn 100% số tiền đã trả`
                : "Bạn có chắc chắn muốn hủy bàn này không?"
            }
            confirmText="Đồng ý"
          />

          {/* popup hủy thành công */}
          <ConfirmPopup
            isOpen={showSuccessPopup}
            onClose={() => setShowSuccessPopup(false)}
            onConfirm={() => setShowSuccessPopup(false)}
            title="Hủy bàn thành công"
            message={
              selectedTableInfo
                ? `Bàn ${selectedTableInfo.tableId} đã được hủy thành công.`
                : "Hủy bàn thành công"
            }
            confirmText="OK"
          />

          {/* Popup xác nhận điểm danh */}
          <ConfirmPopup
            isOpen={showCheckinPopup}
            onClose={() => setShowCheckinPopup(false)}
            onConfirm={handleConfirmCheckin}
            title="Xác nhận điểm danh"
            message="Bạn có chắc chắn muốn điểm danh lịch hẹn này không?"
            confirmText="Đồng ý"
          />

          {/* popup điểm danh thành công */}
          <ConfirmPopup
            isOpen={showCheckinSuccessPopup}
            onClose={() => setShowCheckinSuccessPopup(false)}
            onConfirm={() => setShowCheckinSuccessPopup(false)}
            title="Điểm danh lịch hẹn thành công"
            message="Lịch hẹn đã được điểm danh thành công."
            confirmText="OK"
          />

          {/* Popup xác nhận hoàn tất bàn */}
          <ConfirmPopup
            isOpen={showCheckoutPopup}
            onClose={() => setShowCheckoutPopup(false)}
            onConfirm={handleConfirmComplete}
            title="Xác nhận hoàn tất bàn"
            message="Bạn có chắc chắn muốn hoàn tất bàn này không?"
            confirmText="Đồng ý"
          />

          {/* popup hoàn tất bàn thành công */}
          <ConfirmPopup
            isOpen={showCheckoutSuccessPopup}
            onClose={() => setShowCheckoutSuccessPopup(false)}
            onConfirm={() => setShowCheckoutSuccessPopup(false)}
            title="Hoàn tất lịch hẹn thành công"
            message="Lịch hẹn đã được Hoàn tất thành công."
            confirmText="OK"
          />
        </Card>
      </div>
    </div>
  );
}
