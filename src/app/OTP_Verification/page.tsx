"use client";

import { Suspense } from "react";
import OTPVerificationContent from "./OTPVerificationContent";

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Đang tải...</div>}>
      <OTPVerificationContent />
    </Suspense>
  );
}
