"use client";

import LoginPage from "./login/page";

export default function Home() {
  return (
    <div>
      {/* <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
    
      <TabContent activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      <LoginPage></LoginPage>
    </div>
  );
}
