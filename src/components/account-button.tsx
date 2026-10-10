"use client";

import { LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function AccountButton() {
  const { session, profile, loading } = useAuth();

  return (
    <Link className={`account-button${session ? " signed-in" : ""}`} href="/login">
      {session ? <UserRound size={16} /> : <LogIn size={16} />}
      <span>{loading ? "CHECKING…" : session ? profile?.matric_no ?? "ACCOUNT" : "LOGIN"}</span>
    </Link>
  );
}
