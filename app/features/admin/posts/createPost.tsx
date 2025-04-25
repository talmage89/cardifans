import { Link, redirect } from "react-router";
import { z } from "zod";
import { Prisma } from "~/generated/prisma";
import { requireAuth } from "~/utils/auth.server";
import { PostStatus } from "~/utils/enums";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/createPost";
import { PostForm } from "./components";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuth(request);
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as PostStatus;

  try {
    z.object({
      title: z.string().min(1, { message: "Title is required" }),
      content: z.string().min(1, { message: "Content is required" }),
      status: z.nativeEnum(PostStatus, { message: "Invalid status" }),
    }).parse({ title, content, status });

    await prisma.post.create({ data: { title, content, status } });

    return redirect("/admin/posts");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error);
    }
    return { success: false, errors: { root: ["An unexpected error occurred"] } };
  }
}

export default function CreatePostDetail() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
        <Link
          to="/admin/posts"
          className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          Cancel
        </Link>
      </div>
      <PostForm endpoint="/admin/posts/new" />
    </div>
  );
}
