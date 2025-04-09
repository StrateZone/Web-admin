import React from "react";

import UserProfile from "../profile/user_profile";
import Dashboard from "../dashboard/dashboard";
import Appointments from "../appointments/appointments";
import Posts from "../posts/posts";
import Transactions from "../transactions/transactions";
import System from "../system/system";
import Checkin from "../checkin/checkin";

type TabContentProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function TabContent({
  activeTab,
  //   setActiveTab,
}: TabContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard />;
      case "Cuộc Hẹn":
        return <Appointments />;
      case "Bài Viết":
        return <Posts />;
      case "Hồ Sơ":
        return <UserProfile />;
      case "Các Giao Dịch":
        return <Transactions />;
      case "Hệ Thống":
        return <System />;
      case "Điểm Danh":
        return <Checkin />;
      default:
        return (
          <div className="flex justify-center items-center text-gray-500 h-screen">
            <p>No content available for this tab.</p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
}
