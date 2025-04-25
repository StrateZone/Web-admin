import CommentItem from "./comment_item";

interface CommentListProps {
  comments: any[];
}

export default function CommentList({ comments }: CommentListProps) {
  const parentComments = comments.filter((c) => c.replyTo === null);

  const findReplies = (parentId: string) => {
    // Tìm tất cả comment reply trực tiếp hoặc gián tiếp tới commentId
    const replies: typeof comments = [];

    const queue = [parentId];
    while (queue.length > 0) {
      const currentId = queue.shift();
      const directReplies = comments.filter((c) => c.replyTo === currentId);
      replies.push(...directReplies);
      queue.push(...directReplies.map((r) => r.commentId));
    }

    return replies;
  };

  const renderComments = () => {
    return parentComments.map((parent) => {
      const replies = findReplies(parent.commentId);

      return (
        <div key={parent.commentId} className="space-y-3">
          <h1>Bình Luận</h1>
          <CommentItem comment={parent} />
          {replies.length > 0 && (
            <div className="ml-6 space-y-2 border-l-2 border-gray-300 pl-4">
              {replies.map((reply) => {
                const repliedTo = comments.find(
                  (c) => c.commentId === reply.replyTo,
                );
                const repliedToName = repliedTo?.user.fullName;

                return (
                  <CommentItem
                    key={reply.commentId}
                    comment={reply}
                    repliedToName={repliedToName}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return <div className="space-y-6">{renderComments()}</div>;
}
