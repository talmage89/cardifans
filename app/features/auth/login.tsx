import { Form, redirect, useNavigation } from "react-router";
import { z } from "zod";
import { logIn, requireNoAuth } from "~/utils/auth.server";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireNoAuth(request);
  return session;
}

type ActionData = {
  errors: { email?: string; password?: string; root?: string };
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const { success: schemaSuccess, error: schemaError } = z
    .object({
      email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" }),
      password: z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" }),
    })
    .safeParse({ email, password });

  if (!schemaSuccess) {
    return { errors: schemaError.flatten().fieldErrors } as ActionData;
  }

  try {
    const headers = await logIn(email as string, password as string);
    return redirect("/admin", { headers });
  } catch (error) {
    return { errors: { root: (error as Error).message } } as ActionData;
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Admin Login</h2>
        <Form method="post" action="/auth/login" className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
            {actionData?.errors?.email && <p className="mt-1 text-sm text-red-600">{actionData.errors.email[0]}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
            />
            {actionData?.errors?.password && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.password[0]}</p>
            )}
          </div>
          {actionData?.errors?.root && <p className="text-center text-sm text-red-600">{actionData.errors.root}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={navigation.formAction === "/auth/login"}
          >
            {navigation.formAction === "/auth/login" ? "Logging in..." : "Log in"}
          </button>
        </Form>
      </div>
    </div>
  );
}
