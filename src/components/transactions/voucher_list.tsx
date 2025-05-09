import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import {
  Card,
  CardBody,
  Typography,
  Spinner,
  IconButton,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { config } from "../../../config";
import { DefaultPagination } from "../pagination/pagination";
import ConfirmPopup from "../confirm_popup/confirm_popup";
import AddVoucherPopup, { VoucherFormData } from "./create_voucher";

const TABLE_HEAD = [
  "Tên Voucher",
  "Giá trị giảm giá",
  "Mô tả",
  "Điều kiện sử dụng",
  "Số điểm để đổi",
  "Ngày tạo",
  "Hành động",
];

export default function VoucherTable() {
  const backendApi = config.BACKEND_API;
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${backendApi}/vouchers/samples`, {
        params: {
          "page-number": currentPage,
          "page-size": 5,
        },
      });
      setVouchers(res.data.pagedList || []);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi fetch vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [currentPage]);

  const handleDeleteClick = (id: number) => {
    setSelectedVoucherId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVoucherId) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`${backendApi}/vouchers/${selectedVoucherId}`);
      setVouchers((prev) =>
        prev.filter((v) => v.voucherId !== selectedVoucherId),
      );
      setConfirmOpen(false);
    } catch (error) {
      console.error("Lỗi khi xoá voucher:", error);
      alert("Xoá không thành công.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddVoucher = async (data: VoucherFormData) => {
    try {
      setSubmitting(true);
      await axiosInstance.post(`${backendApi}/vouchers/create-sample`, data);
      setAddOpen(false);
      setSubmitting(false);
      // Refetch vouchers
      const res = await axiosInstance.get(`${backendApi}/vouchers/samples`, {
        params: { "page-number": currentPage, "page-size": 5 },
      });
      setVouchers(res.data.pagedList || []);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Lỗi khi thêm voucher:", err);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="h-full w-full shadow-lg p-6 mt-6">
        <CardBody className="overflow-x-auto">
          <Typography variant="h5" color="blue-gray" className="mb-4">
            Danh sách Voucher
          </Typography>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setAddOpen(true)} color="blue">
              + Thêm Voucher
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner className="h-8 w-8" color="blue" />
            </div>
          ) : (
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold uppercase"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher, index) => {
                  const isLast = index === vouchers.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";
                  return (
                    <tr key={voucher.voucherId}>
                      <td className={classes}>{voucher.voucherName}</td>
                      <td className={classes}>
                        {voucher.value.toLocaleString()}đ
                      </td>
                      <td className={classes}>{voucher.description}</td>
                      <td className={classes}>
                        Đơn đặt trên{" "}
                        {voucher.minPriceCondition.toLocaleString()}đ
                      </td>
                      <td className={classes}>{voucher.pointsCost} điểm</td>
                      <td className={classes}>
                        {new Date(voucher.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>
                      <td className={classes}>
                        <Tooltip content="Xoá voucher">
                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() => handleDeleteClick(voucher.voucherId)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                      </td>
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
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Card>
      <ConfirmPopup
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xoá voucher"
        message="Bạn có chắc chắn muốn xoá voucher này không?"
        confirmDisabled={isDeleting}
      />
      <AddVoucherPopup
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddVoucher}
        submitDisabled={submitting}
      />
    </>
  );
}
