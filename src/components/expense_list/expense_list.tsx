import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { DefaultPagination } from "../pagination/pagination";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import AddMultipleExpensesForm from "./add_multiple_expense";
import EditExpenseForm from "./edit_expense";

type Expense = {
  id: number;
  userId: number;
  systemId: number;
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
};

type ApiResponse = {
  pagedList: Expense[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

const ExpenseList: React.FC = () => {
  const backendApi = config.BACKEND_API;
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const availableMonths = Array.from(
    { length: year === currentYear ? currentMonth : 12 },
    (_, i) => i + 1,
  );
  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => 2020 + i,
  );

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const openEditDialog = (id: number) => {
    setEditingId(id);
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditingId(null);
    setEditOpen(false);
  };

  const fetchExpenses = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await axios.get<ApiResponse>(
        `${backendApi}/expenses?Year=${year}&Month=${month}&page-number=${pageNumber}&page-size=10`,
      );
      const data = res.data.pagedList;

      if (!data || data.length === 0) {
        setIsEmpty(true);
        setExpenses([]); // Đảm bảo không hiển thị dữ liệu cũ
      } else {
        setIsEmpty(false);
        setExpenses(data);
      }
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá khoản chi tiêu này?")) return;

    try {
      await axios.delete(`${backendApi}/expenses/${id}`);
      fetchExpenses(page);
    } catch (err) {
      console.error("Lỗi khi xoá khoản chi tiêu:", err);
      alert("Không thể xoá khoản chi tiêu. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchExpenses(page);
  }, [page, year, month]);

  return (
    <Card className="w-full max-w-5xl mx-auto p-6 mt-6 shadow-md">
      <Typography variant="h5" color="blue-gray" className="mb-6">
        Các chi tiêu
      </Typography>
      <div className="mb-4">
        <label className="block mb-1">Chọn tháng</label>
        <input
          type="month"
          value={`${year}-${month.toString().padStart(2, "0")}`}
          onChange={(e) => {
            if (!e.target.value) return; // chống lỗi khi value rỗng
            const [y, m] = e.target.value.split("-").map(Number);
            setYear(y);
            setMonth(m);
          }}
          required
        />
      </div>
      <Button
        color="blue"
        className="mb-4"
        onClick={handleOpen}
        disabled={loading}
      >
        Thêm khoản chi
      </Button>
      <CardBody>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center items-center h-[300px]">
            <Typography variant="small" color="gray">
              Không có chi tiêu nào
            </Typography>
          </div>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Loại</th>
                <th className="p-2 border">Mô tả</th>
                <th className="p-2 border">Số tiền</th>
                <th className="p-2 border">Ngày thanh toán</th>
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="text-center">
                  <td className="p-2 border">{expense.id}</td>
                  <td className="p-2 border">{expense.type}</td>
                  <td className="p-2 border">{expense.description}</td>
                  <td className="p-2 border">
                    {expense.amount.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="p-2 border">
                    {new Date(expense.transactionDate).toLocaleDateString(
                      "vi-VN",
                    )}
                  </td>
                  <td className="p-2 border">
                    <Button
                      size="sm"
                      color="blue"
                      className="mr-2"
                      onClick={() => openEditDialog(expense.id)}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      size="sm"
                      color="red"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      Xoá
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Dialog open={open} handler={handleOpen} size="lg">
          <DialogHeader>Thêm nhiều khoản chi tiêu</DialogHeader>
          <DialogBody>
            <AddMultipleExpensesForm
              onSuccess={() => {
                fetchExpenses(page);
                setOpen(false);
              }}
            />
          </DialogBody>
        </Dialog>

        <Dialog open={editOpen} handler={closeEditDialog} size="lg">
          <div className="p-4">
            {editingId && (
              <EditExpenseForm
                expenseId={editingId}
                onSuccess={() => {
                  fetchExpenses(page);
                  closeEditDialog();
                }}
              />
            )}
          </div>
        </Dialog>

        <div className="flex justify-center mt-4">
          <DefaultPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default ExpenseList;
