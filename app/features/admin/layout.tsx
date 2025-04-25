import { ArrowRight } from "lucide-react";
import { Link, NavLink, Outlet, useFetcher } from "react-router";
import { requireAuth } from "~/utils/auth.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAuth(request);
  return session;
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const handleLogout = () => {
    fetcher.submit(null, { method: "post", action: "/auth/logout" });
  };

  return (
    <div>
      <header className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="text-2xl font-bold">
              Cardifans Admin
            </Link>
            <NavLink to="/admin/posts" className={({ isActive }) => (isActive ? "text-white" : "text-gray-400")}>
              Posts
            </NavLink>
            <NavLink to="/admin/comments" className={({ isActive }) => (isActive ? "text-white" : "text-gray-400")}>
              Comments
            </NavLink>
            <Link to="/" className="flex items-center gap-2 text-gray-400">
              Back to site <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <h1>{loaderData.user.email}</h1>
            <button
              onClick={handleLogout}
              className="rounded bg-red-600 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle" ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
