import { X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useFetcher } from "react-router";
import { requireAuth } from "~/utils/auth.server";
import { CommentStatus } from "~/utils/enums";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/commentsList";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { post: { select: { id: true, title: true } } },
  });
  return { comments };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuth(request);
  if (request.method === "DELETE") {
    const formData = await request.formData();
    const commentId = formData.get("commentId") as string;
    if (!commentId) {
      return { success: false, error: "Comment ID is required" };
    }
    await prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  }
}

export default function CommentsList({ loaderData }: Route.ComponentProps) {
  const { comments } = loaderData;
  const fetcher = useFetcher();

  const pendingCommentsLength = comments.filter((comment) => comment.status === CommentStatus.PENDING).length;

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success("Comment deleted successfully");
    } else if (fetcher.data?.error) {
      toast.error("Failed to delete comment");
    }
  }, [fetcher.data]);

  const handleDeleteComment = (commentId: string) => {
    fetcher.submit({ commentId }, { method: "DELETE" });
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Comments</h1>

      {pendingCommentsLength > 0 && (
        <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h2 className="mb-2 text-lg font-medium text-gray-700">
            You have {pendingCommentsLength} pending comments to approve.
          </h2>
          <Link
            to="/admin/comments/queue"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            Review pending comments
          </Link>
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex grow flex-col gap-1 border-b border-gray-200 p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{comment.name}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      comment.status === CommentStatus.APPROVED
                        ? "bg-green-100 text-green-800"
                        : comment.status === CommentStatus.REJECTED
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {comment.status}
                  </span>
                </span>
                <p className="text-sm text-gray-500">{comment.createdAt.toLocaleDateString()}</p>
              </div>
              <p className="my-2 text-sm text-gray-700">{comment.content}</p>
              <div className="flex items-center justify-between">
                <Link to={`/posts/${comment.post.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                  Post: {comment.post.title}
                </Link>
                <button
                  type="button"
                  className="cursor-pointer rounded-full p-2 transition-colors hover:bg-red-50"
                  onClick={() => handleDeleteComment(comment.id)}
                  aria-label="Delete comment"
                >
                  <X className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
