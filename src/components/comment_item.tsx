import { useState } from "react";

interface CommentProps {
  comment: any;
}

export default function CommentItem({
  comment,
  repliedToName,
}: CommentProps & { repliedToName?: string }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={comment.user.avatarUrl}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <p className="font-medium text-gray-800 dark:text-gray-200">
          {comment.user.fullName}
        </p>
      </div>

      {repliedToName && (
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
          Replying to <span className="font-semibold">{repliedToName}</span>
        </p>
      )}

      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {new Date(comment.createdAt).toLocaleString("vi-VN")}
      </p>
    </div>
  );
}
