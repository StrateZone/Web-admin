"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { config } from "../../../config";
import PostDetail from "./[id]/page";
import { Card, CardBody } from "@material-tailwind/react";
import { DefaultPagination } from "../pagination/pagination";
import axios from "axios";

type Thread = {
  threadId: number;
  title: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: string;
  createdByNavigation: {
    fullName: string;
    avatarUrl?: string;
  };
  likesCount: number;
  threadsTags: {
    tag: {
      tagName: string;
    };
  }[];
};

type Tag = {
  tagId: number;
  tagName: string;
  status: string;
};

export default function Posts() {
  const [posts, setPosts] = useState<Thread[]>([]);
  const [threadTags, setThreadTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("all");
  const authData =
    typeof window !== "undefined" ? localStorage.getItem("authData") : null;
  const userRole = authData ? JSON.parse(authData)?.userRole : null;
  const isAdmin = userRole === "Admin";

  const router = useRouter();
  const backendApi = config.BACKEND_API;

  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestId = useRef(0);

  const handleTabChange = (value: string | undefined) => {
    if (value === "pending" || value === "all") {
      setActiveTab(value);
      setCurrentPage(1);
      setTotalPages(1);
      setPosts([]); // ✨ Xóa dữ liệu cũ ngay
      setLoading(true); // ✨ Bật loading ngay để UI phản hồi
    }
  };

  const fetchPosts = useCallback(async () => {
    latestRequestId.current += 1;
    const requestId = latestRequestId.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPosts([]);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${backendApi}/threads/filter/statuses-and-tags`,
        {
          signal: controller.signal,
          params: {
            "page-number": currentPage,
            "page-size": 10,
            ...(activeTab === "pending" && { statuses: "pending" }),
          },
        },
      );

      if (requestId === latestRequestId.current) {
        setPosts(response.data.pagedList);
        setTotalPages(response.data.totalPages);
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log("Request cancelled");
      } else if (requestId === latestRequestId.current) {
        setError("Lỗi khi tải danh sách bài viết.");
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, [backendApi, activeTab, currentPage]);

  const [tagLoadingMap, setTagLoadingMap] = useState<{
    [key: number]: boolean;
  }>({});

  const setTagLoading = (tagId: number, isLoading: boolean) => {
    setTagLoadingMap((prev) => ({ ...prev, [tagId]: isLoading }));
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${backendApi}/tags/thread`);
      setThreadTags(response.data);
    } catch (err) {
      console.error("Lỗi khi tải tag:", err);
    }
  };
  const handleHideTag = async (tagId: number) => {
    setTagLoading(tagId, true);
    try {
      await axios.put(`${backendApi}/tags/admin/hide/${tagId}`);
      fetchTags();
    } catch (error) {
      console.error("Lỗi khi ẩn tag:", error);
    } finally {
      setTagLoading(tagId, false);
    }
  };

  const handleReactivateTag = async (tagId: number) => {
    setTagLoading(tagId, true);
    try {
      await axios.put(`${backendApi}/tags/admin/activate/${tagId}`);
      fetchTags();
    } catch (error) {
      console.error("Lỗi khi kích hoạt lại tag:", error);
    } finally {
      setTagLoading(tagId, false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedPostId, activeTab, currentPage]);

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400">
      <Card className="flex flex-col min-h-full p-6">
        <CardBody>
          {selectedPostId ? (
            <PostDetail
              postId={selectedPostId}
              onBack={() => setSelectedPostId(null)}
            />
          ) : (
            <>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => handleTabChange("pending")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "pending"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-400 text-gray-700"
                  }`}
                >
                  Chờ duyệt
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-300 py-10">
                  Không có bài viết nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div
                      key={post.threadId}
                      className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow hover:shadow-lg cursor-pointer transition-all relative"
                      onClick={() => setSelectedPostId(post.threadId)}
                    >
                      {post.thumbnailUrl && (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="w-full h-40 object-cover rounded-t-xl"
                        />
                      )}
                      <div className="p-4 relative">
                        <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Tạo bởi {post.createdByNavigation.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.threadsTags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-800 text-white dark:bg-gray-700 rounded-full px-2 py-0.5 text-gray-900 dark:text-white"
                            >
                              {tag.tag.tagName}
                            </span>
                          ))}
                        </div>

                        <div className="absolute bottom-2 right-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-white"
                                : post.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white"
                                  : post.status === "rejected"
                                    ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-white"
                                    : post.status === "deleted"
                                      ? "bg-red-900 text-red-100 dark:bg-yellow-700 dark:text-white"
                                      : "bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white"
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-4">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {isAdmin && !selectedPostId && (
        <Card className="mt-6 mb-4 p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Các Tag dùng cho bài viết
          </h3>
          <ul className="space-y-2">
            {threadTags.map((tag) => (
              <li
                key={tag.tagId}
                className="flex items-center justify-between bg-gray-200 rounded-md px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-black">
                    {tag.tagName}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full 
              ${
                tag.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-200 text-red-700"
              }
            `}
                  >
                    {tag.status === "active" ? "Đang hoạt động" : "Đã ẩn"}
                  </span>
                </div>

                {tag.status === "active" ? (
                  <button
                    onClick={() => handleHideTag(tag.tagId)}
                    disabled={tagLoadingMap[tag.tagId]}
                    className={`text-xs font-semibold py-1 px-3 rounded transition ${
                      tagLoadingMap[tag.tagId]
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {tagLoadingMap[tag.tagId] ? "Đang ẩn..." : "Ẩn"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivateTag(tag.tagId)}
                    disabled={tagLoadingMap[tag.tagId]}
                    className={`text-xs font-semibold py-1 px-3 rounded transition ${
                      tagLoadingMap[tag.tagId]
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {tagLoadingMap[tag.tagId]
                      ? "Đang kích hoạt..."
                      : "Kích hoạt lại"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
