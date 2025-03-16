"use client";

import { useState } from "react";

import Sidebar from "@/components/sidebar/sidebar";
import TabContent from "@/components/sidebar/tab_content";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <TabContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
