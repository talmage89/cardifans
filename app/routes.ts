import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("features/posts/layout.tsx", [
    route("/:year?/:month?", "features/posts/postsList.tsx"),
    route("posts/:id", "features/posts/postDetail.tsx"),
  ]),
  route("auth/login", "features/auth/login.tsx"),
  route("auth/logout", "features/auth/logout.tsx"),
  route("admin", "features/admin/layout.tsx", [
    index("features/admin/dashboard.tsx"),
    ...prefix("posts", [
      index("features/admin/posts/postsList.tsx"),
      route("new", "features/admin/posts/createPost.tsx"),
      route(":id", "features/admin/posts/editPost.tsx"),
    ]),
    ...prefix("comments", [
      index("features/admin/comments/commentsList.tsx"),
      route("queue", "features/admin/comments/commentsQueue.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
