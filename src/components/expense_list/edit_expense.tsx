import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Typography } from "@material-tailwind/react";
import { config } from "../../../config";
import ConfirmPopup from "../confirm_popup/confirm_popup";

type Expense = {
  id: number;
  userId: number;
  systemId: number;
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
};

type Props = {
  expenseId: number;
  onSuccess?: () => void;
};

const EditExpenseForm: React.FC<Props> = ({ expenseId, onSuccess }) => {
  const backendApi = config.BACKEND_API;
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const formatDateTimeLocal = (dateStr: string) => {
    return dateStr.slice(0, 16); // Cắt bỏ giây và timezone
  };

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await axios.get(`${backendApi}/expenses/${expenseId}`);
        const data = res.data;
        data.transactionDate = toLocalISOString(new Date(data.transactionDate));
        setExpense(data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu expense:", err);
      }
    };

    fetchExpense();
  }, [expenseId]);

  const handleChange = (field: keyof Expense, value: string | number) => {
    if (!expense) return;
    setExpense({ ...expense, [field]: value });
  };

  const submitUpdate = async () => {
    if (!expense) return;

    setLoading(true);
    try {
      await axios.put(`${backendApi}/expenses/${expense.id}`, expense);
      onSuccess?.();
    } catch (err) {
      console.error("Lỗi khi cập nhật expense:", err);
      alert("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="my-6 p-4 border rounded-lg bg-gray-50">
      <Typography variant="h6" className="mb-4">
        Chỉnh sửa khoản chi tiêu
      </Typography>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Số tiền (VNĐ)</label>
          <input
            type="text"
            inputMode="numeric"
            value={expense.amount.toString()}
            onChange={(e) => {
              const raw = e.target.value;

              // Nếu người dùng xóa hết thì cho phép 0
              if (raw === "") {
                handleChange("amount", 0);
                return;
              }

              // Chỉ cho phép số nguyên không âm, không bắt đầu bằng 0 (trừ "0" đơn lẻ)
              if (/^\d+$/.test(raw)) {
                const numeric = Number(raw);
                handleChange("amount", numeric);
              }
            }}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Loại</label>
          <input
            type="text"
            value={expense.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="col-span-2 flex flex-col">
          <label className="text-sm font-medium mb-1">Mô tả</label>
          <input
            type="text"
            value={expense.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="col-span-2 flex flex-col">
          <label className="text-sm font-medium mb-1">Ngày giao dịch</label>
          <input
            type="datetime-local"
            value={formatDateTimeLocal(expense.transactionDate)}
            onChange={(e) =>
              handleChange(
                "transactionDate",
                toLocalISOString(new Date(e.target.value)),
              )
            }
            className="border p-2 rounded"
          />
        </div>
      </div>

      <Button
        onClick={() => setConfirmOpen(true)}
        color="blue"
        disabled={loading}
      >
        {loading ? "Đang cập nhật..." : "Cập nhật"}
      </Button>

      <ConfirmPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          submitUpdate();
        }}
        title="Xác nhận cập nhật"
        message="Bạn có chắc muốn cập nhật khoản chi tiêu này?"
        confirmText="Cập nhật"
      />
    </div>
  );
};

export default EditExpenseForm;
