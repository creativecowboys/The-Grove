"use client";
import { useActionState } from "react";
import { signIn, requestEmailLink } from "./actions";
import styles from "./leads.module.css";

export default function SignInForm({ emailEnabled = false }: { emailEnabled?: boolean }) {
  const [notice, emailAction, emailPending] = useActionState(requestEmailLink, "");
  const [error, action, pending] = useActionState(signIn, "");
  return <>
    {emailEnabled && <form action={emailAction} className={styles.loginForm}>
      <label htmlFor="login-email">Your email</label>
      <input id="login-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      <button className={styles.primaryButton} disabled={emailPending}>{emailPending ? "Sending…" : "Email me a sign-in link"}</button>
      {notice && <p role="status">{notice}</p>}
    </form>}
    <details open={!emailEnabled}><summary>Use an access code instead</summary>
    <form action={action} className={styles.loginForm}>
    <label htmlFor="access-code">Your access code</label>
    <input id="access-code" name="code" type="password" autoComplete="current-password" required maxLength={256} aria-describedby={error ? "login-error" : undefined} />
    {error && <p id="login-error" role="alert">{error}</p>}
    <button className={styles.primaryButton} disabled={pending}>{pending ? "Signing in…" : "Open my leads"}</button>
  </form></details></>;
}
