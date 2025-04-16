"use client";
import React, { useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify"; // Import từ react-toastify
import { config } from "../../../config";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const backendApi = config.BACKEND_API;

  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email không được bỏ trống");
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      return;
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async () => {
    if (!emailError && email) {
      //xu ly ben trong luon ko ca`n tach ra
      try {
        const response = await axios.post(
          `${backendApi}/auth/send-otp?email=${encodeURIComponent(email)}`,
        );

        console.log("API Response:", response.data); // Kiểm tra dữ liệu trả về

        // Kiểm tra nếu API trả về lỗi dù HTTP status vẫn là 200
        if (
          response.data?.success === false ||
          response.data?.statusCode === 404
        ) {
          toast.error("Tài khoản không tồn tại. Vui lòng kiểm tra lại email.");
          return; // Dừng lại nếu tài khoản không tồn tại
        }

        router.push(`/OTP_Verification?email=${encodeURIComponent(email)}`);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="fixed inset-0">
      {/* Thay đổi ở đây - sử dụng fixed inset-0 */}
      <div className="w-full h-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
          style={{ margin: "auto" }}
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold text-white">
                  Đăng nhập
                </h3>
                <p className="text-sm text-gray-300">
                  Trang dành cho ban quản trị
                </p>
              </div>
              <div className="relative w-full">
                <Input
                  color="white"
                  size="lg"
                  className="text-white"
                  maxLength={50}
                  crossOrigin="anonymous"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  error={!!emailError}
                  placeholder="Email"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full font-bold py-3 rounded border-[0.5px]"
                onClick={handleLogin}
              >
                Đăng Nhập
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
