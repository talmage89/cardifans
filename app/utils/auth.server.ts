import dotenv from "dotenv";
import { redirect } from "react-router";
import { supabaseClient } from "./supabase";

dotenv.config();

const ALLOWED_ADMIN_EMAILS: string[] = [];

if (process.env.ADMIN_EMAIL_1) {
  ALLOWED_ADMIN_EMAILS.push(process.env.ADMIN_EMAIL_1);
}
if (process.env.ADMIN_EMAIL_2) {
  ALLOWED_ADMIN_EMAILS.push(process.env.ADMIN_EMAIL_2);
}
if (process.env.ADMIN_EMAIL_3) {
  ALLOWED_ADMIN_EMAILS.push(process.env.ADMIN_EMAIL_3);
}

export async function requireAuth(request: Request) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    throw redirect("/auth/login");
  }

  const accessToken = parseCookie(cookieHeader, "access_token");
  const refreshToken = parseCookie(cookieHeader, "refresh_token");

  if (!accessToken) {
    throw redirect("/auth/login");
  }

  const {
    data: { session },
    error,
  } = await supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || "",
  });

  if (error || !session) {
    const headers = new Headers();
    headers.append("Set-Cookie", "access_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
    headers.append("Set-Cookie", "refresh_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
    throw redirect("/auth/login", { headers });
  }

  if (session.user?.email && !ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
    const headers = new Headers();
    headers.append("Set-Cookie", "access_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
    headers.append("Set-Cookie", "refresh_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
    throw redirect("/auth/login", { headers });
  }

  if (session.access_token !== accessToken) {
    const headers = new Headers();
    headers.append("Set-Cookie", `access_token=${session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    headers.append("Set-Cookie", `refresh_token=${session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    request.headers.set("Cookie", headers.toString());
  }

  return session;
}

// SHOULD ERROR
export async function verifyRegistrationIsDisabled() {
  try {
    const email = `user${Math.round(Math.random() * 1000000)}@cardifans.com`;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password: "Password123!",
    });

    if (!error) {
      console.error("WARNING: User registration is still enabled in Supabase!");
      return false;
    }

    return error.code === "signup_disabled";
  } catch (error) {
    return true;
  }
}

export async function requireNoAuth(request: Request) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  const accessToken = parseCookie(cookieHeader, "access_token");

  if (accessToken) {
    throw redirect("/admin");
  }

  return null;
}

export function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export async function logIn(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  });

  if (!data.session || error) {
    throw new Error(error?.message || "An error occurred");
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
    throw new Error("This account is not authorized to access admin features. Permitted emails: " + ALLOWED_ADMIN_EMAILS.join(", "));
  }

  const headers = new Headers();
  headers.append("Set-Cookie", `access_token=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);
  headers.append(
    "Set-Cookie",
    `refresh_token=${data.session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
  );
  return headers;
}

export async function logOut() {
  await supabaseClient.auth.signOut();
  const headers = new Headers();
  headers.append("Set-Cookie", "access_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  headers.append("Set-Cookie", "refresh_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
  return headers;
}
