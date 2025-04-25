import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useFetcher } from "react-router";
import type { Post } from "~/generated/prisma";
import { requireAuth } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/postsList";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return { posts };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuth(request);
  if (request.method === "DELETE") {
    const formData = await request.formData();
    const postId = formData.get("postId") as string;
    await prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }
}

export default function AdminPostsList({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success("Post deleted successfully");
    } else if (fetcher.data?.error) {
      toast.error("Failed to delete post");
    }
  }, [fetcher.data]);

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetcher.submit({ postId }, { method: "DELETE" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
        <Link
          to="/admin/posts/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post: Post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : post.status === "ARCHIVED"
                            ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <Link
                      to={`/posts/${post.id}`}
                      className="mr-4 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/posts/${post.id}`}
                      className="mr-4 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {posts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No posts found. Create your first post!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
