import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { endSession } from "../auth.server";

export function loader() {
  throw redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  return redirect("/login", {
    headers: { "Set-Cookie": await endSession(request) },
  });
}
