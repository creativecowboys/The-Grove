"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, SESSION_COOKIE, SESSION_SECONDS, validAccessCode } from "@/lib/leads-session";

export async function signIn(_state: string, form: FormData) {
  if (!validAccessCode(form.get("code"))) return "That access code wasn't recognized. Please try again.";
  (await cookies()).set(SESSION_COOKIE, createSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS,
  });
  redirect("/leads");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/leads");
}
