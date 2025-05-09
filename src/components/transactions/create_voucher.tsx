import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Typography,
  IconButton,
} from "@material-tailwind/react";

interface AddVoucherPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherFormData) => void;
  submitDisabled: boolean;
}

export interface VoucherFormData {
  voucherName: string;
  value: number;
  pointsCost: number;
  contributorPointsCost: number;
  description: string;
  minPriceCondition: number;
}

export const AddVoucherPopup: React.FC<AddVoucherPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitDisabled,
}) => {
  const [formData, setFormData] = useState<VoucherFormData>({
    voucherName: "",
    value: 0,
    pointsCost: 0,
    contributorPointsCost: 0,
    description: "",
    minPriceCondition: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Cost") ||
        name === "value" ||
        name === "minPriceCondition"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      voucherName: "",
      value: 0,
      pointsCost: 0,
      contributorPointsCost: 0,
      description: "",
      minPriceCondition: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="w-full max-w-xl px-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex justify-end">
              <IconButton variant="text" onClick={onClose}>
                <i className="fas fa-close text-xl" />
              </IconButton>
            </div>
            <Typography variant="h5" className="text-center mb-4">
              Thêm Voucher Mẫu
            </Typography>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Mã Voucher"
                name="voucherName"
                onChange={handleChange}
                value={formData.voucherName}
                crossOrigin=""
              />
              <Input
                label="Giá trị giảm giá"
                name="value"
                type="number"
                onChange={handleChange}
                value={formData.value}
                crossOrigin=""
              />
              <Input
                label="Số điểm đổi"
                name="pointsCost"
                type="number"
                onChange={handleChange}
                value={formData.pointsCost}
                crossOrigin=""
              />
              <Input
                label="Số điểm đổi cho top contributor"
                name="contributorPointsCost"
                type="number"
                onChange={handleChange}
                value={formData.contributorPointsCost}
                crossOrigin=""
              />
              <Input
                label="Điều kiện giá tối thiểu"
                name="minPriceCondition"
                type="number"
                onChange={handleChange}
                value={formData.minPriceCondition}
                crossOrigin=""
              />
              <Input
                label="Mô tả"
                name="description"
                onChange={handleChange}
                value={formData.description}
                crossOrigin=""
              />
            </div>
            <div className="flex justify-end mt-6 gap-4">
              <Button
                color="blue"
                onClick={handleSubmit}
                disabled={submitDisabled}
              >
                Thêm
              </Button>
              <Button color="red" onClick={onClose} disabled={submitDisabled}>
                Hủy
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
};

export default AddVoucherPopup;
