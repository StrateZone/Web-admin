"use client";

import Sidebar from "@/components/sidebar/sidebar";
import TabContent from "@/components/sidebar/tab_content";
import React from "react";
import { useState } from "react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Admin;
