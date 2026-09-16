import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { leadsAccessConfigured, SESSION_COOKIE, validSession } from "@/lib/leads-session";
import LeadsBoard from "./leads-board";
import SignInForm from "./sign-in-form";
import { signOut } from "./actions";
import styles from "./leads.module.css";

export const metadata: Metadata = { title: "Leads | The Grove", robots: { index: false, follow: false }, alternates: { canonical: "/leads" } };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const signedIn = validSession((await cookies()).get(SESSION_COOKIE)?.value);
  return <section className={styles.workspace}>
    <div className={styles.topbar}><Link href="/" className={styles.brand}>The Grove <span>at DeFoor Farm</span></Link><span className={styles.privateLabel}>Private workspace</span>
      {signedIn && <form action={signOut}><button className={styles.textButton}>Sign out</button></form>}
    </div>
    {signedIn ? <LeadsBoard /> : <div className={styles.login}>
      <p className={styles.eyebrow}>A little room for what comes next</p><h1>Your next celebration starts here.</h1>
      <p>Sign in to see new inquiries and connect with your future guests.</p>
      {leadsAccessConfigured() ? <SignInForm /> : <p role="status">Your private leads workspace is being set up. Please check back soon.</p>}
    </div>}
  </section>;
}
