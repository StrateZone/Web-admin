"use client"; // Bắt buộc nếu dùng useRouter hoặc Redux trong Next.js App Router

import { Button } from "@material-tailwind/react";

import { useRouter, usePathname } from "next/navigation"; // Thay thế useNavigate & useLocation

const menu = [
  { name: "Home", path: "/home" },
  {
    name: "Portfolio",
    path: "/portfolio",
  },
  {
    name: "Watchlist",
    path: "/watchlist",
  },
  {
    name: "Activity",
    path: "/activity",
  },
  { name: "Wallet", path: "/wallet" },
  {
    name: "Payment Detail",
    path: "/payment-details",
  },
  { name: "Withdraw", path: "/withdraw" },
  { name: "Profile", path: "/profile" },
  { name: "Logout", path: "#" },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login"); // Điều hướng về trang chủ sau khi logout
  };

  return (
    <div className="mt-10 space-y-5">
      {menu.map((item) => (
        <div key={item.name} className="w-full">
          <Button
            className={`flex items-center gap-2 py-3 w-full ${
              pathname === item.path ? "bg-gray-200" : "" // Hiển thị active tab
            }`}
            onClick={() => {
              if (item.name === "Logout") {
                handleLogout();
              } else {
                router.push(item.path); // Điều hướng bằng Next.js router
              }
            }}
          >
            <span className="w-8">{item.icon}</span>
            <p>{item.name}</p>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
