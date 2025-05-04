import React, { useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { config } from "../../../config";
import ConfirmPopup from "../confirm_popup/confirm_popup";

type ExpenseInput = {
  userId: number;
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
};

type Props = {
  onSuccess?: () => void;
};

const AddMultipleExpensesForm: React.FC<Props> = ({ onSuccess }) => {
  const backendApi = config.BACKEND_API;
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const userId = authData.userId;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Chuyển sang dùng hàm toLocalISOString
  const toLocalISOString = (date: Date) => {
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  };

  const [newExpenses, setNewExpenses] = useState<ExpenseInput[]>([
    {
      userId: 1,
      amount: 0,
      type: "",
      description: "",
      transactionDate: toLocalISOString(new Date()),
    },
  ]);

  const handleExpenseChange = (
    index: number,
    field: keyof ExpenseInput,
    value: string | number,
  ) => {
    const updated = [...newExpenses];
    if (field === "amount") {
      const num = Number(value);
      updated[index][field] = num < 0 ? 0 : num;
    } else {
      updated[index][field] = value as never;
    }
    setNewExpenses(updated);
  };

  const addRow = () => {
    setNewExpenses([
      ...newExpenses,
      {
        userId: 1,
        amount: 0,
        type: "",
        description: "",
        transactionDate: toLocalISOString(new Date()),
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (newExpenses.length === 1) return;
    const updated = newExpenses.filter((_, idx) => idx !== index);
    setNewExpenses(updated);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${backendApi}/expenses/add-multiple`, newExpenses);
      setNewExpenses([
        {
          userId: 1,
          amount: 0,
          type: "",
          description: "",
          transactionDate: toLocalISOString(new Date()),
        },
      ]);
      onSuccess?.();
    } catch (err) {
      console.error("Lỗi khi thêm chi tiêu:", err);
      alert("Không thể thêm. Vui lòng kiểm tra dữ liệu.");
    } finally {
      setLoading(false);
      setConfirmOpen(false); // Đóng popup sau khi gửi
    }
  };

  // ✅ Không đổi timezone sang UTC nữa — chỉ cắt định dạng để hiển thị
  const formatDateTimeLocal = (dateStr: string) => {
    return dateStr.slice(0, 16); // "YYYY-MM-DDTHH:mm"
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-gray-50">
      <Typography variant="h6" className="mb-4">
        Thêm nhiều khoản chi tiêu
      </Typography>

      <div className="flex items-end">
        <button
          onClick={addRow}
          type="button"
          className="text-blue-600 underline text-sm"
        >
          + Thêm chi tiêu
        </button>
      </div>

      {newExpenses.map((expense, idx) => (
        <div key={idx} className="grid grid-cols-6 gap-4 items-start mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Số tiền (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Số tiền"
              value={expense.amount.toString()}
              onChange={(e) => {
                const raw = e.target.value;

                // Nếu chuỗi rỗng thì cho là 0
                if (raw === "") {
                  handleExpenseChange(idx, "amount", 0);
                  return;
                }

                // Chỉ cho phép số nguyên dương (hoặc 0 đơn lẻ)
                if (/^\d+$/.test(raw)) {
                  const numeric = Number(raw);
                  handleExpenseChange(idx, "amount", numeric);
                }
              }}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Loại</label>
            <input
              type="text"
              placeholder="Loại"
              value={expense.type}
              onChange={(e) => handleExpenseChange(idx, "type", e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Mô tả</label>
            <input
              type="text"
              placeholder="Mô tả"
              value={expense.description}
              onChange={(e) =>
                handleExpenseChange(idx, "description", e.target.value)
              }
              className="border p-2 rounded"
            />
          </div>

          <div className="flex flex-col min-w-[205px]">
            <label className="text-sm font-medium mb-1">Ngày giao dịch</label>
            <input
              type="datetime-local"
              value={formatDateTimeLocal(expense.transactionDate)}
              onChange={(e) =>
                handleExpenseChange(
                  idx,
                  "transactionDate",
                  toLocalISOString(new Date(e.target.value)),
                )
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex items-end">
            {newExpenses.length > 1 && (
              <button
                onClick={() => removeRow(idx)}
                type="button"
                className="text-red-600 underline text-sm"
              >
                Xoá
              </button>
            )}
          </div>
        </div>
      ))}

      <Button
        onClick={() => setConfirmOpen(true)}
        color="green"
        className="mt-4"
        disabled={loading}
      >
        {loading ? "Đang thêm..." : "Thêm các khoản chi"}
      </Button>
      <ConfirmPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Xác nhận thêm"
        message="Bạn có chắc chắn muốn thêm các khoản chi tiêu này?"
        confirmText="Thêm ngay"
      />
    </div>
  );
};

export default AddMultipleExpensesForm;
