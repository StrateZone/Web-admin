import React from "react";

import UserProfile from "../profile/user_profile";

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
      case "Profile":
        return <UserProfile />;

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
