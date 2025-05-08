import {
  Button,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Input,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { config } from "../../../config";
import { DefaultPagination } from "../pagination/pagination";
import { TrashIcon } from "lucide-react";
import ConfirmPopup from "../confirm_popup/confirm_popup";
import axiosInstance from "@/utils/axiosInstance";

type Profanity = {
  id: number;
  word: string;
};

export default function ProfanitiesManagement() {
  const backendApi = config.BACKEND_API;

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [profanities, setProfanities] = useState<Profanity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [newProfanity, setNewProfanity] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setCurrentPage(1); // reset về page 1 mỗi khi search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const abortControllerRef = useRef<AbortController | null>(null);
  let latestRequestId = 0;

  const fetchProfanities = async () => {
    const requestId = ++latestRequestId;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${backendApi}/profanities`, {
        signal: controller.signal,
        params: {
          "page-number": currentPage,
          "page-size": 10,
          ...(debouncedSearchValue && { search: debouncedSearchValue }),
        },
      });

      if (requestId === latestRequestId) {
        setProfanities(response.data.pagedList);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
      } else if (requestId === latestRequestId) {
        setError("Lỗi khi tải danh sách từ cấm.");
      }
    } finally {
      if (requestId === latestRequestId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfanities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchValue]);

  const confirmDelete = async () => {
    if (confirmDeleteId == null) return;

    setDeletingId(confirmDeleteId);
    try {
      await axiosInstance.delete(
        `${backendApi}/profanities/${confirmDeleteId}`,
      );
      setProfanities((prev) =>
        prev.filter((item) => item.id !== confirmDeleteId),
      );
    } catch (error) {
      alert("Xóa thất bại, vui lòng thử lại.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleCreateProfanity = async () => {
    if (!newProfanity.trim()) {
      setMessage({ text: "Vui lòng nhập từ cần thêm.", type: "error" });
      return;
    }

    setIsCreating(true);
    try {
      await axiosInstance.post(`${backendApi}/profanities`, newProfanity, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage({ text: "Thêm từ cấm thành công!", type: "success" });
      setNewProfanity("");
      fetchProfanities(); // Refresh danh sách
    } catch (error) {
      setMessage({ text: "Lỗi khi thêm từ cấm.", type: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  // useEffect để ẩn thông báo sau 3 giây
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null); // Xóa thông báo sau 3 giây
      }, 3000);

      return () => clearTimeout(timer); // Dọn dẹp nếu component unmount hoặc message thay đổi
    }
  }, [message]); // Phụ thuộc vào message để kích hoạt khi message thay đổi

  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-6 p-6 flex justify-between items-center"
      >
        <Typography variant="h6" color="white">
          Danh sách các từ cấm
        </Typography>
      </CardHeader>

      <CardBody className="space-y-4">
        <Input
          type="text"
          label="Tìm kiếm từ cấm..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-64"
          crossOrigin=""
        />
        <div className="my-4" />
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newProfanity}
            onChange={(e) => setNewProfanity(e.target.value)}
            placeholder="Nhập từ cấm mới..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleCreateProfanity}
            loading={isCreating}
            color="blue"
            size="sm"
            disabled={isCreating}
          >
            Thêm
          </Button>
        </div>
        {message && (
          <div
            className={`mt-2 text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : profanities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy kết quả nào.
          </div>
        ) : (
          <ul className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
            {profanities.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <span className="text-gray-800">{item.word}</span>
                <IconButton
                  variant="text"
                  color="red"
                  onClick={() => setConfirmDeleteId(item.id)}
                  disabled={deletingId === item.id}
                  className="ml-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center mt-4">
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </CardBody>
      <ConfirmPopup
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa từ cấm này không?"
        confirmText="Xóa"
      />
    </Card>
  );
}
