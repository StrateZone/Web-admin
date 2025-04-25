"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdLogout } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { BsFileEarmarkPost } from "react-icons/bs";
import { GrSystem, GrTransaction } from "react-icons/gr";
import { FaCheck } from "react-icons/fa";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [userFullName, setuserFullName] = useState<string>("");

  // Lấy role từ localStorage khi component mount
  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        setUserRole(parsedData?.userRole || "");
        setuserFullName(parsedData?.fullName || "");
      } catch (err) {
        console.error("Lỗi phân tích authData:", err);
      }
    }
  }, []);
  const MENU_ITEMS = [
    {
      title: "Dashboard",
      icon: () => <MdDashboard />,
      roles: ["Admin"],
    },
    {
      title: "Các Giao Dịch",
      icon: () => <GrTransaction />,
      roles: ["Admin"],
    },
    {
      title: "Hệ Thống",
      icon: () => <GrSystem />,
      roles: ["Admin"],
    },
    {
      title: "Cuộc Hẹn",
      icon: () => <CiCalendar />,
      roles: ["Admin", "Staff"],
    },
    // {
    //   title: "Điểm Danh",
    //   icon: () => <FaCheck />,
    //   roles: ["Staff", "Admin"],
    // },
    {
      title: "Bài Viết",
      icon: () => <BsFileEarmarkPost />,
      roles: ["Staff", "Admin"],
    },
    // {
    //   title: "Hồ Sơ",
    //   icon: () => (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       viewBox="0 0 24 24"
    //       fill="currentColor"
    //       className="w-5 h-5"
    //     >
    //       <path
    //         fillRule="evenodd"
    //         d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    //         clipRule="evenodd"
    //       />
    //     </svg>
    //   ),
    // },
    {
      title: "Logout",
      icon: () => <MdLogout />,
    },
  ];

  return (
    <div className="relative flex h-screen w-full max-w-[20rem] flex-col bg-white p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
      <div className="flex p-4 my-2 relative">
        <h5 className="block text-xl font-semibold text-blue-gray-900 ml-8">
          {userRole === "Admin"
            ? "Xin Chào Admin"
            : userRole === "Staff"
              ? `Xin Chào Nhân Viên${userFullName ? ` - ${userFullName}` : ""}`
              : "Xin Chào"}
        </h5>
      </div>

      <nav className="flex flex-col gap-1 p-2 text-base font-normal text-blue-gray-700">
        {MENU_ITEMS.filter(
          (item) => !item.roles || item.roles.includes(userRole),
        ).map((item, index) => (
          <div
            key={index}
            role="button"
            onClick={() => {
              if (item.title === "Logout") {
                localStorage.removeItem("authData");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                router.push("/Login"); // redirect về trang login
              } else {
                setActiveTab(item.title);
              }
            }}
            className={`flex items-center p-3 transition-all rounded-lg hover:bg-blue-gray-50 hover:text-blue-gray-900 cursor-pointer ${
              activeTab === item.title ? "bg-black text-white" : ""
            }`}
          >
            <div
              className={`grid mr-4 text-${
                activeTab === item.title ? "white" : "black"
              } place-items-center`}
            >
              {item.icon()}
            </div>
            <span>{item.title}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
