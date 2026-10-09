import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <main className="login-shell">
      <Link href="/" className="back-link login-back"><ArrowLeft size={17} /> DASHBOARD</Link>
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-intro">
          <span className="login-icon"><LockKeyhole size={25} /></span>
          <span className="eyebrow">STUDENT ACCESS</span>
          <h1 id="login-title">YOUR UMK,<br />YOUR SCHEDULE.</h1>
          <p>Sign in to securely access your private planner and personal schedule events.</p>
        </div>
        <div className="login-form-panel">
          <span className="eyebrow">SECURE SIGN IN</span>
          <h2>Continue with your student email</h2>
          <AuthPanel />
        </div>
      </section>
      <p className="login-footer">MY UMK · PERSONAL OPERATIONS BOARD</p>
    </main>
  );
}
