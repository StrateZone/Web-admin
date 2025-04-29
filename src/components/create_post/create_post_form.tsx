import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@material-tailwind/react";
import { toast } from "react-toastify";
import { config } from "../../../config";
import dynamic from "next/dynamic";

const MyQuillEditor = dynamic(
  () => import("@/components/quill_editor/quill_editor"),
  {
    ssr: false,
  },
);

interface Tag {
  tagId: number;
  tagName: string;
  tagColor: string;
  status: string;
}

interface CreatePostFormProps {
  userId: number;
  onCancel: () => void;
  onCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({
  userId,
  onCancel,
  onCreated,
}) => {
  const [threadTags, setThreadTags] = useState<Tag[]>([]);
  const backendApi = config.BACKEND_API;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(
          "https://backend-production-ac5e.up.railway.app/api/tags/by-role?role=Admin",
        );
        setThreadTags(response.data); // Lưu các tag vào state
      } catch (err) {
        console.error("Lỗi fetch tag:", err);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const newPost = {
      createdBy: userId,
      title: formData.get("title") as string,
      content: content,
      tagIds: Array.from(formData.getAll("tagIds")).map(Number),
      isDrafted: formData.get("isDrafted") === "on",
    };
    setIsSubmitting(true);
    try {
      const threadResponse = await axios.post(`${backendApi}/threads`, newPost);
      toast.success("Đăng bài thành công!");

      if (thumbnail) {
        const threadId = threadResponse.data.threadId;
        const formData = new FormData();
        formData.append("Type", "thread");
        formData.append("EntityId", threadId.toString());
        formData.append("ImageFile", thumbnail);
        formData.append("Width", "0");
        formData.append("Height", "0");

        await axios.post(`${backendApi}/images/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            //Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
      }

      onCreated();
    } catch (err) {
      toast.error("Đăng bài thất bại!");
      //console.error("Lỗi tạo bài viết:", err);
    }
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    if (!file.type.match(/image\/(jpeg|png|webp|jpg)/)) {
      toast.error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        console.log("Preview URL:", event.target.result);
        setPreviewImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setThumbnail(file);
  };

  return (
    <Card className="p-4 mt-4">
      <button onClick={onCancel} className="mb-4 text-blue-600 font-medium">
        ← Quay lại danh sách
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Tạo bài viết mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Tiêu đề"
          className="w-full p-2 rounded border"
          required
        />
        <MyQuillEditor value={content} onChange={setContent} />

        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-800">
            Thumbnails (Ảnh đại diện) <span className="text-red-500">*</span>
            <span className="text-sm text-gray-500 ml-2">
              (Tối đa 5MB, JPEG/PNG/WEBP)
            </span>
          </label>
          <input
            type="file"
            onChange={handleThumbnailChange}
            accept="image/*"
            className="w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 file:text-sm file:font-medium file:text-blue-600 file:hover:bg-blue-100"
            required
          />
          {previewImage && (
            <div className="mt-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-800">
            Chọn thẻ bài viết
          </label>
          <div className="flex flex-wrap gap-2">
            {threadTags.map((tag) => (
              <label key={tag.tagId} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.tagId}
                  className="hidden peer"
                  onChange={(e) => {
                    e.currentTarget.nextElementSibling?.setAttribute(
                      "style",
                      e.target.checked
                        ? `background-color: ${tag.tagColor}; color: white; border-color: ${tag.tagColor}`
                        : `background-color: transparent; color: ${tag.tagColor}; border-color: ${tag.tagColor}`,
                    );
                  }}
                />
                <span
                  className="inline-block px-3 py-1 rounded-full border text-sm transition-all peer-checked:text-white peer-checked:bg-opacity-90"
                  style={{
                    borderColor: tag.tagColor,
                    color: tag.tagColor,
                    backgroundColor: "transparent",
                  }}
                >
                  {tag.tagName}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* <label className="flex items-center space-x-2">
          <input type="checkbox" name="isDrafted" />
          <span>Lưu nháp</span>
        </label> */}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-green-600 text-white px-4 py-2 rounded ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
          >
            {isSubmitting ? "Đang đăng..." : "Đăng bài"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePostForm;
