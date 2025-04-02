"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function OTPVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 chữ số.");
      return;
    }

    try {
      const response = await axios.post(
        "https://backend-production-5bc5.up.railway.app/api/auth/verify-otp",
        { email, otp: otpCode },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data.success && response.data.data) {
        localStorage.setItem("authData", JSON.stringify(response.data.data));
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
        router.push("/Admin");
      } else {
        setError(response.data.message || "OTP không hợp lệ!");
      }
    } catch (error) {
      setError("Có lỗi xảy ra, vui lòng thử lại!");
      console.error("Lỗi API:", error);
    }
  };

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  const handleResendOTP = async () => {
    setIsResendDisabled(true);
    setTimer(300);

    try {
      await axios.post(
        `https://backend-production-5bc5.up.railway.app/api/auth/send-otp?email=${encodeURIComponent(email || "")}`,
        {},
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      setError("Không thể gửi lại mã OTP!");
      setIsResendDisabled(false);
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      setOtp(pastedData.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[url('https://png.pngtree.com/background/20230611/original/pngtree-rain-storm-and-a-chess-board-picture-image_3129264.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gray-900/60" />
      <div className="relative w-full max-w-screen-sm mx-auto border border-white bg-transparent bg-opacity-90 backdrop-blur-sm p-6 rounded-md shadow-md mt-20">
        <div className="text-white text-center flex flex-col gap-3">
          <h3 className="text-3xl font-bold">Nhập mã OTP</h3>
          <p className="text-sm text-gray-300">
            Mã OTP đã gửi đến <b>{email}</b>
          </p>

          <div className="flex justify-center space-x-4">
            {otp.map((num, index) => (
              <input
                key={index}
                ref={(el) => el && (inputsRef.current[index] = el)}
                type="text"
                className="bg-zinc-900 border border-zinc-700 w-12 h-12 text-center text-lg font-bold rounded-lg outline-none text-black"
                value={num}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                maxLength={1}
                onPaste={index === 0 ? handlePaste : undefined}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            onClick={handleVerifyOTP}
            className="w-full font-bold bg-black text-white py-2 rounded border border-gray-500 hover:bg-gray-800 transition duration-150 mt-3"
          >
            Xác nhận OTP
          </Button>

          <div className="text-center text-sm mt-3">
            <p>
              {isResendDisabled ? (
                <span className="text-gray-400">
                  Gửi lại sau {formatTime(timer)}
                </span>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="font-semibold text-gray-200 hover:text-gray-400"
                >
                  Gửi lại mã
                </button>
              )}
            </p>
            <p className="mt-2">
              <Link
                href="/Login"
                className="font-semibold text-gray-200 hover:text-gray-400"
              >
                ← Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
