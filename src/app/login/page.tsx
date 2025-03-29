"use client";
import React, { useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";

import axios from "axios"; // Import axios

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

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
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async () => {
    if (!emailError && email) {
      //xu ly ben trong luon ko ca`n tach ra
      try {
        const response = await axios.post(
          `https://backend-production-5bc5.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email)}`,
        );

        if (response.status === 200) {
          router.push(`/otp_verification?email=${encodeURIComponent(email)}`);
        }
      } catch (error) {
        console.error("Lỗi khi gửi OTP:");
      }
    }
  };

  return (
    <div>
      <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center bg-repeat flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-900/60" />
        <div
          style={{ marginTop: "120px", marginBottom: "50px" }}
          className="relative w-full max-w-screen-sm mx-auto border-2 border-white bg-transparent bg-opacity-95 backdrop-blur-sm opacity-90 p-8 rounded-md shadow-lg"
        >
          <div className="text-white text-center flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-extrabold text-white">
                  Đăng nhập
                </h3>
                <p className="text-sm text-gray-300">
                  Trang dành cho quản trị viên
                </p>
              </div>
              <div className="relative w-full">
                <Input
                  color="white"
                  variant="outlined" // Thay đổi từ "standard" -> "outlined"
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
                className="w-full font-bold bg-black text-white py-3 rounded border-[0.5px]"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Đang gửi OTP..." : "Đăng nhập"}
              </Button>
            </div>
            {/* <div className="text-center text-sm mt-4">
              <p>
                Bạn chưa có tài khoản?{" "}
                <Link
                  href={`/register`}
                  className="font-semibold text-gray-200 cursor-pointer hover:text-gray-400"
                >
                  Đăng ký miễn phí
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
