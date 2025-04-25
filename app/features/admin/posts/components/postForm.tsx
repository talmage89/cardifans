import { useState } from "react";
import { useFetcher } from "react-router";
import type { Post } from "~/generated/prisma";
import { PostStatus as PostStatusEnum } from "~/utils/enums";

type PostFormData = {
  title: string;
  content: string;
  status: PostStatusEnum;
};

type PostFormProps = {
  endpoint: string;
  initialData?: Post;
};

export const PostForm = ({ endpoint, initialData }: PostFormProps) => {
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";
  const { errors } = fetcher.data || {};

  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    status: (initialData?.status as PostStatusEnum) || PostStatusEnum.DRAFT,
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <fetcher.Form method="post" action={endpoint}>
        <div className="mb-4">
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors?.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={10}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors?.content && <p className="text-sm text-red-500">{errors.content[0]}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as PostStatusEnum })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value={PostStatusEnum.DRAFT}>Draft</option>
            <option value={PostStatusEnum.PUBLISHED}>Published</option>
            <option value={PostStatusEnum.ARCHIVED}>Archived</option>
          </select>
          {errors?.status && <p className="text-sm text-red-500">{errors.status[0]}</p>}
        </div>

        {errors?.root && <p className="text-sm text-red-500">{errors.root[0]}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
          >
            {busy ? "Saving..." : "Save Post"}
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
};
