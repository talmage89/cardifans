import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Link, useFetcher } from "react-router";
import { requireAuth } from "~/utils/auth.server";
import { CommentStatus } from "~/utils/enums";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/commentsQueue";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  const comments = await prisma.comment.findMany({
    where: { status: CommentStatus.PENDING },
    include: { post: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return { comments };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuth(request);
  const formData = await request.formData();
  const commentId = formData.get("commentId") as string;
  const status = formData.get("status") as CommentStatus;
  await prisma.comment.update({ where: { id: commentId }, data: { status } });
  return { success: true };
}

export default function CommentsQueue({ loaderData }: Route.ComponentProps) {
  const { comments } = loaderData;
  const fetcher = useFetcher();

  const handleCommentStatus = (commentId: string, status: CommentStatus) => {
    const formData = new FormData();
    formData.append("commentId", commentId);
    formData.append("status", status);
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link to="/admin/comments" className="mb-6 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
        <ArrowLeft className="h-4 w-4" />
        Back to comments list
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Approve Comments ({comments.length} left)</h1>

      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="flex grow flex-col gap-1 border-b border-gray-200 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{comment.name}</p>
              <p className="text-sm text-gray-500">{comment.createdAt.toLocaleDateString()}</p>
            </div>
            <p className="my-2 text-sm">{comment.content}</p>
            <div className="flex items-center justify-between">
              <Link to={`/posts/${comment.post.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                Post: {comment.post.title}
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
                  onClick={() => handleCommentStatus(comment.id, CommentStatus.APPROVED)}
                >
                  <CheckCircle className="text-green-600" />
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
                  onClick={() => handleCommentStatus(comment.id, CommentStatus.REJECTED)}
                >
                  <XCircle className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-gray-500">No comments to approve.</p>
      )}
    </div>
  );
}
