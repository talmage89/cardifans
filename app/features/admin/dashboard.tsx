import { MessageSquareText, Newspaper, Plus } from "lucide-react";
import { Link } from "react-router";
import { requireAuth } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  const postsCount = await prisma.post.count();
  const commentsCount = await prisma.comment.count();
  return { postsCount, commentsCount };
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  const { postsCount, commentsCount } = loaderData;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                <Newspaper className="text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{postsCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-700">
            <div className="text-sm">
              <Link
                to="/admin/posts"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all posts <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                <MessageSquareText className="text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Comments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{commentsCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-700">
            <div className="text-sm">
              <Link
                to="/admin/comments"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Manage comments <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                <Plus className="text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Create Content</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">New Post</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 dark:bg-gray-700">
            <div className="text-sm">
              <Link
                to="/admin/posts/new"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create a new post <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
