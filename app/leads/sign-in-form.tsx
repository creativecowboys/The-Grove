"use client";
import { useActionState } from "react";
import { signIn } from "./actions";
import styles from "./leads.module.css";

export default function SignInForm() {
  const [error, action, pending] = useActionState(signIn, "");
  return <form action={action} className={styles.loginForm}>
    <label htmlFor="access-code">Your access code</label>
    <input id="access-code" name="code" type="password" autoComplete="current-password" required maxLength={256} aria-describedby={error ? "login-error" : undefined} />
    {error && <p id="login-error" role="alert">{error}</p>}
    <button className={styles.primaryButton} disabled={pending}>{pending ? "Signing in…" : "Open my leads"}</button>
  </form>;
}
