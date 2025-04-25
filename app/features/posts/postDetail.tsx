import DOMPurify from "dompurify";
import { Check, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useFetcher, type ShouldRevalidateFunctionArgs } from "react-router";
import { z } from "zod";
import { PostStatus, CommentStatus } from "~/utils/enums";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/postDetail";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await prisma.post.findUnique({
    where: { id: params.id, status: PostStatus.PUBLISHED },
    include: { comments: { where: { status: CommentStatus.APPROVED } } },
  });
  return { post };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const postId = params.id;
  const content = formData.get("content");
  const name = formData.get("name");

  try {
    z.object({
      content: z.string().min(1, { message: "Content is required" }),
      name: z.string().min(1, { message: "Name is required" }),
    }).parse({ content, name });

    await prisma.comment.create({
      data: {
        content: content as string,
        name: name as string,
        postId,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    } else if (error instanceof Error) {
      return { success: false, errors: { comment: [error.message] } };
    }
    return { success: false, errors: { comment: ["An unknown error occurred"] } };
  }
}

export function shouldRevalidate(arg: ShouldRevalidateFunctionArgs) {
  if (arg.actionResult?.success) return true;
  return false;
}

type CommentForm = { content: string; name: string };

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";

  const [sanitizedContent, setSanitizedContent] = useState("");
  const [commentForm, setCommentForm] = useState<CommentForm>({
    content: "",
    name: "",
  });

  useEffect(() => {
    if (!post) return;
    const sanitizedContent = DOMPurify.sanitize(post.content);
    setSanitizedContent(sanitizedContent);
  }, [post]);

  useEffect(() => {
    if (fetcher.data?.success) {
      toast(
        <div className="flex items-center gap-8">
          <CheckCircle className="h-8 w-8 text-green-500" />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Comment posted successfully!</p>
            <p className="text-sm">Your comment will be reviewed by the moderators and published shortly.</p>
          </div>
        </div>,
      );
      setCommentForm({ content: "", name: "" });
    }
  }, [fetcher.data]);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{post.title}</h1>

        <p className="text-sm">
          <span className="font-semibold">Posted:</span> {post.createdAt.toLocaleDateString()}
        </p>

        <div className="mt-4 text-sm" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="border-b border-gray-200 pb-2 font-semibold">Comments ({post.comments.length})</p>

        {post.comments.length > 0 &&
          post.comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-1 border-b border-gray-200 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{comment.name}</p>
                <p className="text-sm text-gray-500">{comment.createdAt.toLocaleDateString()}</p>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
      </div>

      <fetcher.Form method="post" className="flex flex-col gap-4">
        <p className="font-semibold">Add a comment</p>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={commentForm.name}
            onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
            placeholder="Enter your name"
          />
          {fetcher.data?.errors?.name && <p className="text-sm text-red-500">{fetcher.data.errors.name[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Your Comment
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={commentForm.content}
            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
            placeholder="Write your comment here..."
          />
          {fetcher.data?.errors?.content && <p className="text-sm text-red-500">{fetcher.data.errors.content[0]}</p>}
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer self-start rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 md:w-auto"
          disabled={busy}
        >
          {busy ? "Submitting..." : "Post"}
        </button>
      </fetcher.Form>
    </div>
  );
}
