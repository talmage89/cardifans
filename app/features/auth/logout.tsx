import { redirect } from "react-router";
import { logOut } from "~/utils/auth.server";

export async function action() {
  const headers = await logOut();
  return redirect("/", { headers });
}

export default function Logout() {
  return null;
}
