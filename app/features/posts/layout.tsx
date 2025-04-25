import { Link, NavLink, Outlet, useLocation } from "react-router";
import { PostStatus } from "~/utils/enums";
import { prisma } from "~/utils/prisma.server";
import type { Route } from "./+types/layout";

export async function loader() {
  const posts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const archives = posts.reduce(
    (acc, post) => {
      const date = post.createdAt;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${month}`;
      if (!acc[key]) {
        acc[key] = { year, month, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, { year: number; month: number; count: number }>,
  );

  return { archives: Object.values(archives) };
}

export default function PostsLayout({ loaderData }: Route.ComponentProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="container mx-auto flex max-w-5xl grow flex-col px-4 py-12">
        <header>
          <div className="flex items-center justify-between border-b border-gray-200 pb-8">
            <div>
              <Link to="/">
                <h1 className="text-5xl font-semibold text-red-500">PLAIN PICTURE PARADE</h1>
              </Link>
              <p className="text-sm">Dedicated to the Swedish band The Cardigans. established Sept 1997</p>
            </div>
            {/* <Link to="/about" className="text-lg">
              About
            </Link> */}
          </div>
          {location.pathname === "/" && (
            <div className="border-b border-gray-200 py-8">
              <h2 className="text-2xl">
                The most comprehensive collection of pictures of The Cardigans, A Camp, and Nina Persson every
                assembled.
              </h2>
            </div>
          )}
        </header>
        <main className="flex grow">
          <div className="grow py-4 pr-4">
            <Outlet />
          </div>
          {loaderData.archives.length > 0 && (
            <div className="w-1/3 border-l border-gray-200 py-6 pl-4">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">Archives</h3>
              <ul className="space-y-3">
                {loaderData.archives.map((archive) => (
                  <li key={`${archive.year}-${archive.month}`}>
                    <NavLink
                      to={`/${archive.year}/${archive.month}`}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 ${isActive ? "bg-gray-100" : ""}`
                      }
                      end
                    >
                      <span className="text-gray-700 group-hover:text-gray-900">
                        {new Date(archive.year, archive.month - 1, 1).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 group-hover:bg-gray-200">
                        {archive.count}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Plain Picture Parade. All rights reserved.</p>
          <Link to="/admin" className="text-sm">
            Site Management
          </Link>
        </div>
      </footer>
    </div>
  );
}
