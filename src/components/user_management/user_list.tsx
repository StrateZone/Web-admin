import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  CardHeader,
  Badge,
  Tooltip,
  Tabs,
  TabsHeader,
  Tab,
  Input,
  Chip,
  Button,
} from "@material-tailwind/react";
import { config } from "../../../config";
import { DefaultPagination } from "../pagination/pagination";
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ConfirmPopup from "../confirm_popup/confirm_popup";
import axiosInstance from "@/utils/axiosInstance";

interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: string;
  userLabel: string;
  status: string;
  avatarUrl: string;
}

const TABS = [
  {
    label: "Người dùng",
    value: "user",
  },
  {
    label: "Thành viên Cộng Đồng",
    value: "member",
  },
  {
    label: "Ban quản trị",
    value: "staff_admin",
  },
];

const UserCardList: React.FC = () => {
  const backendApi = config.BACKEND_API;
  const [users, setUsers] = useState<User[]>([]);
  const [selectedType, setSelectedType] = useState("user");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Active":
        return { label: "Đang hoạt động", color: "green" };
      case "Unactivated":
        return { label: "Chưa kích hoạt", color: "blue" };
      case "Suspended":
        return { label: "Bị vô hiệu hóa", color: "red" };
      default:
        return { label: "Không xác định", color: "gray" };
    }
  };

  const [showKickPopup, setShowKickPopup] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"Active" | "Suspended" | null>(
    null,
  );

  const handleOpenKickPopup = (user: User) => {
    setSelectedUser(user);
    setShowKickPopup(true);
  };

  const handleConfirmKick = async () => {
    if (!selectedUser?.userId) return;
    setIsKicking(true);
    try {
      await axiosInstance.put(
        `${backendApi}/users/kick/${selectedUser?.userId}`,
      );
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi kick người dùng:", error);
      alert("Kick người dùng thất bại!");
    } finally {
      setIsKicking(false);
      setShowKickPopup(false);
      setSelectedUser(null);
    }
  };

  const handleSearchChange = (value: string | undefined) =>
    setSearchValue(value ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${backendApi}/users/all/management`,
        {
          params: {
            "page-number": page,
            "page-size": 9,
            Type: selectedType,
            ...(debouncedSearchValue && { SearchValue: debouncedSearchValue }),
          },
        },
      );
      const data = res.data.pagedList.map((u: any) => ({
        userId: u.userId,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        userRole: u.userRole,
        userLabel: u.userLabel,
        status: u.status,
        avatarUrl: u.avatarUrl,
      }));

      const dataList = res.data.pagedList;

      if (!dataList || dataList.length === 0) {
        setIsEmpty(true);
        setUsers([]); // Đảm bảo không hiển thị dữ liệu cũ
      } else {
        setIsEmpty(false);
        setUsers(data);
      }
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Lỗi khi fetch users:", err);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusChange = (
    user: User,
    targetStatus: "Suspended" | "Active",
  ) => {
    setSelectedUser(user);
    setNewStatus(targetStatus);
    setConfirmOpen(true);
  };

  const handleStatusClick = (user: User, status: "Active" | "Suspended") => {
    setSelectedUser(user);
    setNewStatus(status);
    setConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser || !newStatus) return;
    setIsChangingStatus(true);

    try {
      if (newStatus === "Suspended") {
        // Gọi API riêng khi suspend
        await axiosInstance.put(
          `${backendApi}/users/suspend/${selectedUser.userId}`,
        );
      } else if (newStatus === "Active" && selectedUser.userRole === "Member") {
        // Các trường hợp dùng API thông thường
        await axiosInstance.put(`${backendApi}/users/${selectedUser.userId}`, {
          userId: selectedUser.userId,
          status: newStatus,
          userRole: selectedUser.userRole,
        });
      } else {
        // Các trường hợp khác dùng API thông thường
        await axiosInstance.put(`${backendApi}/users/${selectedUser.userId}`, {
          userId: selectedUser.userId,
          status: newStatus,
        });
      }
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setIsChangingStatus(false);
      setConfirmOpen(false);
      setSelectedUser(null);
      setNewStatus(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearchValue, selectedType]);

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400">
      <Card className="w-full px-6 py-4">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <Typography variant="h5" className="mb-4 text-black">
            Danh sách người dùng
          </Typography>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs
              value={selectedType}
              className="w-full max-w-[500px] min-w-[300px]"
            >
              <TabsHeader>
                {TABS.map(({ label, value }) => (
                  <Tab
                    key={value}
                    value={value}
                    onClick={() => {
                      setSelectedType(value);
                      setPage(1);
                    }}
                  >
                    {label}
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="w-full md:w-72">
              <Input
                label="Tìm kiếm"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto px-0 min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
            </div>
          ) : isEmpty ? (
            <div className="flex justify-center items-center h-[300px]">
              <Typography variant="small" color="gray">
                Không có người dùng nào
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => {
                const isMember = user.userRole === "Member";
                const isTopContributor = user.userLabel === "top_contributor";
                const isAdmin = user.userRole === "Admin";
                const isStaff = user.userRole === "Staff";

                return (
                  <Card
                    key={user.userId}
                    className={`p-4 hover:shadow-md transition-shadow rounded-xl
                        ${isMember ? "border border-purple-200" : ""}
                        ${isAdmin ? "border border-red-300 bg-red-50" : ""}
                        ${isStaff ? "border border-green-300 bg-green-50" : ""}
                      `}
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        overlap="circular"
                        placement="bottom-end"
                        className={`border-2 border-white ${
                          isMember
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"
                            : isTopContributor
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : isAdmin
                                ? "bg-gradient-to-r from-red-500 to-pink-500"
                                : isStaff
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : "bg-blue-gray-100"
                        }`}
                        content={
                          (isMember ||
                            isTopContributor ||
                            isAdmin ||
                            isStaff) && (
                            <Tooltip
                              content={
                                isMember
                                  ? "Thành viên câu lạc bộ"
                                  : isTopContributor
                                    ? "Top Contributor"
                                    : isAdmin
                                      ? "Quản trị viên"
                                      : "Nhân viên"
                              }
                            >
                              <CheckBadgeIcon className="h-5 w-5 text-white" />
                            </Tooltip>
                          )
                        }
                      >
                        <Avatar
                          src={
                            user.avatarUrl ||
                            "https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg"
                          }
                          alt={user.username}
                          size="lg"
                          className={`border-2 ${
                            isMember
                              ? "border-purple-500 shadow-lg shadow-purple-500/20"
                              : isTopContributor
                                ? "border-yellow-500 shadow-lg shadow-yellow-500/30"
                                : "border-blue-100"
                          }`}
                        />
                      </Badge>
                      <div>
                        <Typography
                          variant="h5"
                          className={`text-gray-900 truncate ${
                            isMember
                              ? "text-purple-600"
                              : isTopContributor
                                ? "text-yellow-700"
                                : isAdmin
                                  ? "text-red-500"
                                  : isStaff
                                    ? "text-green-400"
                                    : "text-gray-800"
                          }`}
                        >
                          {user.username}
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          {isMember && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              MEMBER
                            </span>
                          )}
                          {isTopContributor && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              TOP CONTRIBUTOR
                            </span>
                          )}
                          {isAdmin && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white">
                              ADMIN
                            </span>
                          )}
                          {isStaff && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white">
                              NHÂN VIÊN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardBody className="mt-4 px-0 py-2 text-sm text-gray-700">
                      <p>
                        <strong>Họ tên:</strong> {user.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>SĐT:</strong> {user.phone}
                      </p>
                      {(() => {
                        const { label, color } = getStatusInfo(user.status);
                        return (
                          <Chip
                            size="sm"
                            color={color as any}
                            variant="filled"
                            value={label}
                            className="text-[10px] px-2 py-0.5 w-full max-w-[107px]"
                          />
                        );
                      })()}
                    </CardBody>
                    <p>
                      --------------------------------------------------------------------
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {isMember && (
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                          onClick={() => handleOpenKickPopup(user)}
                          disabled={isKicking}
                        >
                          {isKicking && selectedUser?.userId === user.userId
                            ? "Đang xử lý..."
                            : "Kick khỏi Cộng Đồng"}
                        </Button>
                      )}

                      {(user.status === "Active" ||
                        user.status === "Unactivated") &&
                        user.userRole !== "Admin" && (
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                            onClick={() =>
                              confirmStatusChange(user, "Suspended")
                            }
                            disabled={isChangingStatus}
                          >
                            {isChangingStatus &&
                            selectedUser?.userId === user.userId
                              ? "Đang xử lý..."
                              : "Vô hiệu hóa"}
                          </Button>
                        )}
                      {user.status === "Suspended" && (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                          onClick={() => confirmStatusChange(user, "Active")}
                          disabled={isChangingStatus}
                        >
                          {isChangingStatus &&
                          selectedUser?.userId === user.userId
                            ? "Đang xử lý..."
                            : "Kích hoạt lại"}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardBody>
        <div className="flex justify-center mt-4">
          <DefaultPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Card>
      <ConfirmPopup
        isOpen={showKickPopup}
        onClose={() => setShowKickPopup(false)}
        onConfirm={handleConfirmKick}
        title="Xác nhận kick người dùng"
        message={`Bạn có chắc chắn muốn kick người dùng ${selectedUser?.username} khỏi Cộng Đồng không? \n Bạn sẽ không thể thêm người này lại vào Cộng Đồng và họ sẽ phải tự đăng ký lại`}
        confirmText="Kick"
        confirmDisabled={isKicking}
      />
      <ConfirmPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title="Xác nhận thay đổi trạng thái"
        message={`Bạn có chắc chắn muốn ${
          newStatus === "Suspended"
            ? `vô hiệu hóa ${selectedUser?.username}? \n Vô hiệu hóa sẽ không hủy Gói Hội Viên của `
            : "kích hoạt lại"
        } tài khoản ${selectedUser?.username}?`}
        confirmText="Xác nhận"
        confirmDisabled={isChangingStatus}
      />
    </div>
  );
};

export default UserCardList;
