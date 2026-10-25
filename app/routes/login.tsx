import { useRef, useState } from "react";
import { data, Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import {
  authenticate,
  getUser,
  listDemoLogins,
  safeRedirectPath,
  startSession,
} from "../auth.server";

export function meta() {
  return [
    { title: "Ingresar | TansaManager" },
    {
      name: "description",
      content: "Ingreso al panel de operaciones de TansaManager.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (user) throw redirect("/");

  const url = new URL(request.url);
  return {
    redirectTo: safeRedirectPath(url.searchParams.get("redirectTo")),
    accounts: listDemoLogins(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const redirectTo = safeRedirectPath(String(form.get("redirectTo") ?? ""));

  if (!email.trim() || !password) {
    return data(
      { error: "Completá el correo y la contraseña.", email },
      { status: 400 },
    );
  }

  const user = authenticate(email, password);
  if (!user) {
    return data(
      { error: "El correo o la contraseña no coinciden.", email },
      { status: 401 },
    );
  }

  return redirect(redirectTo, {
    headers: { "Set-Cookie": await startSession(request, user.id) },
  });
}

export default function Login({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submitRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState(actionData?.email ?? "");
  const [password, setPassword] = useState("");
  const submitting = navigation.formMethod === "POST";
  const error = actionData?.error;
  const sharedPassword = loaderData.accounts.every(
    (account) => account.password === loaderData.accounts[0]?.password,
  )
    ? loaderData.accounts[0]?.password
    : null;

  return (
    <main className="login-screen">
      <div className="login-stack">
        <section className="login-panel">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              T
            </span>
            <span>TansaManager</span>
          </span>
          <h1>Ingresar</h1>
          <p className="login-lead">
            Panel de operaciones de Banca privada S.R.L.
          </p>

          <Form method="post" className="login-form" replace>
            <input type="hidden" name="redirectTo" value={loaderData.redirectTo} />
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error ? (
              <p id="login-error" className="login-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              ref={submitRef}
              className="login-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>
          </Form>

          <div className="login-demo">
            <p className="login-demo-title">Cuentas de demostración</p>
            <ul>
              {loaderData.accounts.map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    className="demo-account"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      submitRef.current?.focus();
                    }}
                  >
                    <span>
                      <strong>{account.role}</strong>
                      <span>{account.email}</span>
                      {sharedPassword ? null : (
                        <span className="demo-account-password">
                          {account.password}
                        </span>
                      )}
                    </span>
                    <span className="demo-account-action">Usar</span>
                  </button>
                </li>
              ))}
            </ul>
            {sharedPassword ? (
              <p className="login-demo-password">
                Contraseña: <span>{sharedPassword}</span>
              </p>
            ) : null}
          </div>
        </section>
        <p className="login-footnote">
          Sesión local de demostración. Todavía no consulta un directorio real.
        </p>
      </div>
    </main>
  );
}
