"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { config } from "../../../config";
import PostDetail from "./[id]/page";
import { Avatar, Card, CardBody } from "@material-tailwind/react";
import { DefaultPagination } from "../pagination/pagination";
import axios from "axios";
import CreatePostForm from "../create_post/create_post_form";

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
      tagColor: string;
    };
  }[];
};

type Tag = {
  tagId: number;
  tagName: string;
  status: string;
  tagColor: string;
};

export default function Posts() {
  const [posts, setPosts] = useState<Thread[]>([]);
  const [threadTags, setThreadTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("all");
  const authData =
    typeof window !== "undefined" ? localStorage.getItem("authData") : null;
  const userRole = authData ? JSON.parse(authData)?.userRole : null;
  const isAdmin = userRole === "Admin";
  const [isCreating, setIsCreating] = useState(false);
  const backendApi = config.BACKEND_API;

  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestId = useRef(0);

  const handleTabChange = (value: string | undefined) => {
    if (value === "pending" || value === "all") {
      setActiveTab(value);
      setCurrentPage(1);
      setTotalPages(1);
      setPosts([]);
      setLoading(true);
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

    const all_statuses = [
      "published",
      "rejected",
      "pending",
      "deleted",
      "hidden",
      "edit_pending",
    ];

    const pending_statuses = ["pending", "edit_pending"];

    try {
      const params: any = {
        "page-number": currentPage,
        "page-size": 10,
        ...(searchKeyword && { Search: searchKeyword }),
      };

      if (activeTab === "pending") {
        pending_statuses.forEach((status) => {
          params.statuses = params.statuses || [];
          params.statuses.push(status);
        });
      } else {
        all_statuses.forEach((status) => {
          params.statuses = params.statuses || [];
          params.statuses.push(status);
        });
      }

      const response = await axios.get(
        `${backendApi}/threads/filter/statuses-and-tags`,
        {
          signal: controller.signal,
          params,
          paramsSerializer: (params) => {
            const query = new URLSearchParams();
            for (const key in params) {
              const value = params[key];
              if (Array.isArray(value)) {
                value.forEach((v) => query.append(key, v));
              } else {
                query.append(key, value);
              }
            }
            return query.toString();
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
  }, [backendApi, activeTab, currentPage, searchKeyword]);

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
  }, [selectedPostId, activeTab, currentPage, searchKeyword]);

  const renderContent = () => {
    if (selectedPostId) {
      return (
        <PostDetail
          postId={selectedPostId}
          onBack={() => setSelectedPostId(null)}
        />
      );
    }

    if (isCreating) {
      return (
        <CreatePostForm
          userId={authData ? JSON.parse(authData)?.userId : 1}
          onCancel={() => setIsCreating(false)}
          onCreated={() => {
            setIsCreating(false);
            fetchPosts();
          }}
        />
      );
    }

    return (
      <>
        {isAdmin && (
          <div className="mb-4">
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              + Tạo bài viết mới
            </button>
          </div>
        )}

        {/* Tab, Post list, Pagination... */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div className="flex space-x-4">
            <button
              onClick={() => handleTabChange("all")}
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

          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1); // reset lại trang khi tìm
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                    <Avatar
                      src={
                        post.createdByNavigation.avatarUrl ||
                        "https://docs.material-tailwind.com/img/face-2.jpg"
                      }
                      alt="avatar"
                      className="w-8 h-8"
                    />{" "}
                    {post.createdByNavigation.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.threadsTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs rounded-full px-2 py-0.5"
                        style={{
                          backgroundColor: tag.tag.tagColor,
                          color: "#fff", // hoặc dùng màu tối hơn nếu tagColor là màu sáng
                        }}
                      >
                        {tag.tag.tagName}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-2 right-2">
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
    );
  };

  return (
    <div className="flex flex-col min-h-full p-6 bg-gray-400 relative">
      <Card className="flex flex-col min-h-full p-6">
        <CardBody>{renderContent()}</CardBody>
      </Card>

      {isAdmin && !selectedPostId && !isCreating && (
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
                  <p
                    className="text-sm font-medium text-black"
                    style={{ color: tag.tagColor }}
                  >
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
