import React, { useEffect, useRef, useState } from "react";
import { DefaultPagination } from "../pagination/pagination";
import { config } from "../../../config";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";

interface Table {
  tableId: number;
  roomId: number;
  gameTypeId: number;
  status: string;
}

export default function TableList() {
  const backendApi = config.BACKEND_API;

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"; // Màu xanh cho "active"
      case "has_room":
        return "bg-yellow-500"; // Màu vàng cho "has_room"
      case "out_of_service":
        return "bg-red-500"; // Màu đỏ cho "out_of_service"
      default:
        return "bg-gray-500"; // Màu xám mặc định
    }
  };

  // Hàm lấy label tiếng Việt cho trạng thái
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "has_room":
        return "Có phòng";
      case "out_of_service":
        return "Ngưng hoạt động";
      default:
        return "Không xác định";
    }
  };

  const gameTypeTranslations: Record<string, string> = {
    1: "Cờ vua",
    2: "Cờ tướng",
    3: "Cờ vây",
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchTables = async () => {
    const requestId = ++latestRequestIdRef.current;

    // Abort request cũ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${backendApi}/tables`, {
        signal: controller.signal,
        params: {
          "page-number": currentPage,
          "page-size": 10,
          ...(debouncedSearch && { search: debouncedSearch }),
        },
      });

      // Chỉ xử lý nếu là request mới nhất
      if (requestId === latestRequestIdRef.current) {
        setTables(res.data.pagedList);
        setTotalPages(res.data.totalPages);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
      } else if (requestId === latestRequestIdRef.current) {
        setError("Đã xảy ra lỗi khi tải danh sách bàn.");
      }
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTables();
  }, [currentPage, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset về page 1 mỗi khi search
  };

  return (
    <div className="p-4 min-h-full p-6 bg-gray-400">
      <Card className="w-full max-w-6xl mx-auto px-6 py-4">
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Danh sách bàn
          </Typography>
        </CardHeader>
        <Input
          type="text"
          label="Tìm kiếm theo số bàn"
          value={search}
          onChange={handleSearchChange}
          className="w-64 bg-white rounded"
          crossOrigin=""
          containerProps={{
            className: "w-64", // class cho div bao ngoài
          }}
        />

        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
            </div>
          ) : error ? (
            <div>{error}</div>
          ) : (
            <ul className="space-y-4">
              {Array.isArray(tables) && tables.length > 0 ? (
                tables.map((table) => (
                  <li
                    key={table.tableId}
                    className="flex justify-between items-center p-4 bg-white rounded shadow"
                  >
                    <span>Bàn {table.tableId}</span>
                    <span>Phòng {table.roomId}</span>
                    <span>{gameTypeTranslations[table.gameTypeId]}</span>
                    <span
                      className={`px-2 py-0.5 text-xs text-white rounded-full ${getStatusColor(
                        table.status,
                      )}`}
                    >
                      {getStatusLabel(table.status)}
                    </span>
                  </li>
                ))
              ) : (
                <div className="text-center text-gray-600 mt-4">
                  Không có dữ liệu.
                </div>
              )}
            </ul>
          )}
        </CardBody>

        <div className="flex justify-center mt-4">
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Card>
    </div>
  );
}
