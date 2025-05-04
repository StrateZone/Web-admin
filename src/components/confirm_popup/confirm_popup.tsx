import {
  Button,
  Card,
  CardBody,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import React from "react";

interface ConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmDisabled?: boolean;
}

export function ConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  confirmDisabled = false,
}: ConfirmPopupProps) {
  if (!isOpen) return null; // Ẩn popup nếu không mở

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="w-full max-w-xl px-4">
        <Card className="max-w-xl">
          <CardBody>
            <div className="flex w-full justify-end">
              <IconButton variant="text" onClick={onClose}>
                <i className="fas fa-close text-xl"></i>
              </IconButton>
            </div>
            <div className="text-center px-6">
              <Typography color="blue-gray" className="mb-6 mt-2" variant="h4">
                {title}
              </Typography>
              <Typography className="text-[16px] font-normal text-gray-500 whitespace-pre-line">
                {message}
              </Typography>
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  color="green"
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                >
                  {confirmText}
                </Button>
                <Button
                  color="red"
                  onClick={onClose}
                  disabled={confirmDisabled}
                >
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

export default ConfirmPopup;
