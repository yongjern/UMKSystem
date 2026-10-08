"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase";

export function AuthPanel() {
  const { session, profile, loading, error: authError, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function requestSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    setMessage("");
    try {
      const { error: signInError } = await getSupabaseClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
          data: { matric_no: matricNo.trim().toUpperCase() },
        },
      });
      if (signInError) throw signInError;
      setMessage("Sign-in link sent. Check your email and open the link in this browser.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send the sign-in link.");
    } finally {
      setSending(false);
    }
  }

  async function handleSignOut() {
    setError("");
    try {
      await signOut();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign out.");
    }
  }

  if (loading) return <div className="auth-panel" aria-live="polite">Checking sign-in…</div>;
  if (session) {
    return (
      <div className="auth-panel" aria-live="polite">
        <span>{profile ? `SIGNED IN · ${profile.matric_no}` : "Loading profile…"}</span>
        <button type="button" onClick={() => void handleSignOut()}>SIGN OUT</button>
        {authError || error ? <small role="alert">{authError ?? error}</small> : null}
      </div>
    );
  }
  return (
    <form className="auth-panel auth-form" onSubmit={(event) => void requestSignIn(event)}>
      <label><span>STUDENT EMAIL</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@student.umk.edu.my" /></label>
      <label><span>MATRIC NO.</span><input value={matricNo} onChange={(event) => setMatricNo(event.target.value)} required placeholder="Your matric number" /></label>
      <button type="submit" disabled={sending}>{sending ? "SENDING…" : "EMAIL SIGN-IN LINK"}</button>
      <small>Use your student email. Your matric number is stored in your profile; the email link verifies sign-in.</small>
      {message ? <small role="status">{message}</small> : null}
      {authError || error ? <small role="alert">{authError ?? error}</small> : null}
    </form>
  );
}
