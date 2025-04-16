import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  ChipProps,
  Input,
  Tab,
  Tabs,
  TabsHeader,
  Typography,
} from "@material-tailwind/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DefaultPagination } from "../pagination/pagination";
import axios from "axios";
import { config } from "../../../config";

const TABS = [
  {
    label: "Tất cả",
    value: "all",
  },
  {
    label: "Của người dùng",
    value: "user",
  },
  {
    label: "Của Câu Lạc Bộ",
    value: "system",
  },
];

const TABLE_HEAD = [
  "ID",
  "Người dùng",
  "Nội dung",
  "Số tiền",
  "Loại biến động",
  "Thời gian",
  "Mã Zalopay",
];

type TransactionData = {
  id: number;
  ofUser: number;
  referenceId: string;
  content: string;
  amount: number;
  transactionType: number;
  createdAt: string;
  ofUserNavigation: { username: string; fullName?: string; email?: string };
};

const getTransactionLabel = (
  type: number,
): { label: string; color: ChipProps["color"] } => {
  switch (type) {
    case 0:
      return { label: "Nạp tiền", color: "green" };
    case 1:
      return { label: "Rút tiền", color: "red" };
    case 2:
      return { label: "Hoàn tiền", color: "blue" };
    case 3:
      return { label: "Thanh toán", color: "amber" };
    default:
      return { label: "Không xác định", color: "gray" };
  }
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const backendApi = config.BACKEND_API;

  const abortControllerRef = useRef<AbortController | null>(null);
  let latestRequestId = 0;

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const fetchTransactions = useCallback(async () => {
    // Tăng requestId mới
    const requestId = ++latestRequestId;

    // Hủy request cũ nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Tạo controller mới cho request này
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const res = await axios.get(`${backendApi}/transactions`, {
        signal: controller.signal,
        params: {
          "page-number": currentPage,
          "page-size": 10,
          Type: selectedType,
          ...(debouncedSearchValue && { SearchValue: debouncedSearchValue }),
        },
      });

      // Chỉ xử lý nếu là request mới nhất
      if (requestId === latestRequestId) {
        setTransactions(res.data.pagedList);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Failed to fetch transactions:", error);
      }
    } finally {
      if (requestId === latestRequestId) {
        setIsLoading(false);
      }
    }
  }, [backendApi, currentPage, selectedType, debouncedSearchValue]);

  useEffect(() => {
    setIsLoading(true);
    fetchTransactions();
    return () => abortControllerRef.current?.abort();
  }, [fetchTransactions]);

  const handleSearchChange = (value: string | undefined) =>
    setSearchValue(value ?? "");

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400">
      <div className="flex-grow flex flex-col">
        <Card className="w-full px-6 py-4">
          <CardHeader floated={false} shadow={false} className="rounded-none">
            <div className="mb-8 flex items-center justify-between gap-8">
              <div>
                <Typography variant="h5" color="blue-gray">
                  Danh sách biến động số dư
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                  Các giao dịch trong hệ thống
                </Typography>
              </div>
              {/* <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button className="flex items-center gap-3" size="sm">
                  <UserPlusIcon strokeWidth={2} className="h-4 w-4" />
                  Thêm chi phí của clb
                </Button>
              </div> */}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <Tabs
                value={selectedType}
                className="w-full max-w-[500px] min-w-[300px]"
              >
                <TabsHeader>
                  {TABS.map(({ label, value }) => (
                    <Tab
                      key={value}
                      value={value}
                      onClick={() => {
                        setSelectedType(value);
                        setCurrentPage(1);
                      }}
                    >
                      {label}
                    </Tab>
                  ))}
                </TabsHeader>
              </Tabs>
              <div className="w-full md:w-72">
                <Input
                  label="Tìm kiếm"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          </CardHeader>

          <CardBody className="overflow-auto px-0 min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
              </div>
            ) : isEmpty ? (
              <div className="flex justify-center items-center h-[300px]">
                <Typography variant="small" color="gray">
                  Không có giao dịch nào
                </Typography>
              </div>
            ) : (
              <table className="w-full table-auto text-left">
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const { label, color } = getTransactionLabel(
                      tx.transactionType,
                    );
                    return (
                      <tr key={tx.id} className="even:bg-blue-gray-50/50">
                        <td className="p-4">{tx.id}</td>
                        <td className="p-4">
                          {tx.ofUserNavigation?.email ?? "Hệ Thống"}
                        </td>
                        <td className="p-4 whitespace-pre-line">
                          {tx.content.split(" / ").map((part, idx) => (
                            <div key={idx}>{part.trim()}</div>
                          ))}
                        </td>
                        <td className="p-4">{tx.amount.toLocaleString()}₫</td>
                        <td className="p-4">
                          <Chip
                            variant="ghost"
                            size="sm"
                            color={color}
                            value={label}
                          />
                        </td>
                        <td className="p-4">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">{tx.referenceId ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>

          <div className="flex justify-center mt-4">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
