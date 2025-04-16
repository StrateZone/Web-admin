"use client";
import Sidebar from "@/components/sidebar/sidebar";
import TabContent from "@/components/sidebar/tab_content";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("Điểm Danh");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const userRole = authData.userRole;

    if (userRole !== "Staff") {
      router.replace("/unauthorized"); // vẫn đúng với App Router
    } else {
      setIsAuthorized(true);
    }
  }, []);

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/5 h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="w-full h-full overflow-y-auto flex flex-col">
        <div className="flex-grow">
          <TabContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
