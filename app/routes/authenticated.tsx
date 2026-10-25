import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/authenticated";
import { getUser, safeRedirectPath } from "../auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    const url = new URL(request.url);
    const redirectTo = safeRedirectPath(url.pathname + url.search);
    const params = new URLSearchParams({ redirectTo });
    throw redirect(`/login?${params.toString()}`);
  }

  return { user };
}

export default function AuthenticatedLayout() {
  return <Outlet />;
}
