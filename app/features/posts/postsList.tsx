import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Post, Prisma } from "~/generated/prisma";
import { PostStatus } from "~/utils/enums";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/postsList";

export async function loader({ params }: Route.LoaderArgs) {
  const { year, month } = params;

  const where: Prisma.PostWhereInput = { status: PostStatus.PUBLISHED };
  if (year && month) {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    where.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return { posts };
}

export default function PostsList({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;
  return (
    <div className="flex flex-col">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="border-b border-gray-200 py-8">
            <PostComponent post={post} />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No posts found</p>
      )}
    </div>
  );
}

const PostComponent = ({ post }: { post: Post }) => {
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    const sanitizedContent = DOMPurify.sanitize(post.content);
    setSanitizedContent(sanitizedContent);
  }, [post]);

  return (
    <div key={post.id} className="flex flex-col gap-4">
      <Link
        to={`/posts/${post.id}`}
        className="text-xl underline decoration-gray-500 decoration-dotted underline-offset-3"
      >
        {post.title}
      </Link>
      <p className="text-sm">
        <span className="font-semibold">Posted:</span> {post.createdAt.toLocaleDateString()}
      </p>
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
};
