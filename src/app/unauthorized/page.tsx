"use client";

import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push("Login"); // Đường dẫn đến trang đăng nhập
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-red-500">
        Bạn không có quyền truy cập trang này.
      </h1>
      <button
        onClick={handleBackToLogin}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Quay về đăng nhập
      </button>
    </div>
  );
}
