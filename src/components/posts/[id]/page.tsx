import { useEffect, useState } from "react";
import { config } from "../../../../config";
import DOMPurify from "dompurify";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommentList from "@/components/comment_list";
import {
  Card,
  CardBody,
  Tab,
  Tabs,
  Typography,
} from "@material-tailwind/react";
import TabContent from "@/components/sidebar/tab_content";
import { TabsContext } from "@material-tailwind/react/components/Tabs/TabsContext";

type Thread = {
  threadId: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  status: string;
  createdAt: string;
  createdByNavigation: {
    fullName: string;
    avatarUrl?: string;
  };
  likesCount: number;
  threadsTags: {
    tag: {
      tagId: number;
      tagName: string;
      tagColor: string;
    };
  }[];
  comments: {
    content: string;
    user: {
      username: string;
      avatarUrl?: string;
    };
    createdAt: string;
  }[];
};

export default function PostDetail({
  postId,
  onBack,
}: {
  postId: number;
  onBack: () => void;
}) {
  const [post, setPost] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authData =
    typeof window !== "undefined" ? localStorage.getItem("authData") : null;
  const userRole = authData ? JSON.parse(authData)?.userRole : null;
  const isAdmin = userRole === "Admin";
  const backendApi = config.BACKEND_API;

  // Hàm gọi API approve bài viết
  const handleApprove = async () => {
    if (!postId) return;

    try {
      const res = await fetch(`${backendApi}/threads/approve/${postId}`, {
        method: "PUT",
      });

      if (!res.ok) {
        throw new Error("Không thể approve bài viết.");
      }

      fetchPost();
      toast.success("Bài viết đã được duyệt!");
    } catch (err) {
      setError("Lỗi khi approve bài viết.");
      toast.error("Lỗi khi approve bài viết.");
    }
  };

  // Hàm gọi API reject bài viết
  const handleReject = async () => {
    if (!postId) return;

    try {
      const res = await fetch(`${backendApi}/threads/reject/${postId}`, {
        method: "PUT",
      });

      if (!res.ok) {
        throw new Error("Không thể reject bài viết.");
      }

      fetchPost();
      toast.success("Bài viết đã bị từ chối!");
    } catch (err) {
      setError("Lỗi khi reject bài viết.");
      toast.error("Lỗi khi reject bài viết.");
    }
  };

  const handleDelete = async () => {
    if (!postId) return;

    try {
      const res = await fetch(`${backendApi}/threads/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Không thể ẩn bài viết.");
      }

      toast.success("Bài viết đã xóa!");
      onBack();
    } catch (err) {
      setError("Lỗi khi ẩn bài viết.");
      toast.error("Lỗi khi ẩn bài viết.");
    }
  };

  const fetchPost = async () => {
    try {
      const res = await fetch(`${backendApi}/threads/${postId}`);
      if (!res.ok) throw new Error("Không tìm thấy bài viết");

      const data = await res.json();
      setPost(data);
    } catch (err) {
      setError("Không thể tải bài viết.");
      toast.error("Không thể tải bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
      </div>
    );
  if (!post)
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-lg transition-all ease-in-out duration-300"
        >
          ← Quay lại danh sách
        </button>
        <div>Bài viết không tồn tại.</div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <ToastContainer />
      {/* Nút Quay lại */}
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-lg transition-all ease-in-out duration-300"
      >
        ← Quay lại danh sách
      </button>

      {/* Hình ảnh thumbnail */}
      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          alt={post.title}
          className="w-full h-60 object-cover rounded-xl mb-4 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        />
      )}

      {/* Tiêu đề bài viết */}
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
        {post.title}
      </h1>

      {post.threadsTags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.threadsTags.map((item) => (
            <span
              key={item.tag.tagId}
              className="text-xs rounded-full px-2 py-0.5"
              style={{
                backgroundColor: item.tag.tagColor,
                color: "#fff", // hoặc dùng màu tối hơn nếu tagColor là màu sáng
              }}
            >
              {item.tag.tagName}
            </span>
          ))}
        </div>
      )}

      {/* Thông tin tác giả và ngày tạo */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-semibold">Tác giả:</span>{" "}
        {post.createdByNavigation.fullName}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className="font-semibold">Ngày tạo:</span>{" "}
        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
      </p>
      {/* Các nút Approve và Reject chỉ hiển thị khi bài viết có trạng thái pending */}
      {(post.status === "pending" || post.status === "edit_pending") && (
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Duyệt
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Từ chối
          </button>
        </div>
      )}
      {post.status === "published" && isAdmin && (
        <div className="mb-4">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
          >
            Xóa bài viết
          </button>
        </div>
      )}

      {/* Hiển thị trạng thái */}
      <div className="mb-4">
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            post.status === "published"
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-white"
              : post.status === "pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white"
                : post.status === "edit_pending"
                  ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-white"
                  : post.status === "rejected"
                    ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white"
                    : post.status === "deleted"
                      ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-white"
                      : post.status === "hidden"
                        ? "bg-gray-700 text-gray-100 dark:bg-gray-800 dark:text-white"
                        : "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white"
          }`}
        >
          {post.status === "published"
            ? "Đã duyệt"
            : post.status === "rejected"
              ? "Đã từ chối"
              : post.status === "deleted"
                ? "Đã xóa"
                : post.status === "pending"
                  ? "Chờ duyệt"
                  : post.status === "edit_pending"
                    ? "Chờ duyệt cập nhật"
                    : post.status === "hidden"
                      ? "Đã ẩn"
                      : "Chờ duyệt"}
        </span>
      </div>

      {/* Nội dung bài viết */}
      <span>Nội dung</span>
      <div
        className="prose dark:prose-invert max-w-none mb-6 px-4 py-6 bg-gray-50 text-gray-900 dark:text-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 ease-in-out"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(
            post.content || "<p>(Không có nội dung)</p>",
          ),
        }}
      />

      {post.comments?.length > 0 && (
        <>
          <Typography>Bình Luận</Typography>
          <Card>
            <CardBody>
              {/* Comment section được tách riêng */}
              <CommentList comments={post.comments} />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
