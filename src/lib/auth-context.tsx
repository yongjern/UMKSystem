"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

type Profile = { id: string; matric_no: string };
type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profileState, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    void Promise.resolve()
      .then(() => getSupabaseClient())
      .then((supabase) => {
        if (!active) return null;
        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (active) {
            setSession(nextSession);
            if (!nextSession) setProfileState(null);
          }
        });
        unsubscribe = () => listener.subscription.unsubscribe();
        return supabase.auth.getSession();
      })
      .then((result) => {
        if (!result || !active) return;
        if (result.error) throw result.error;
        setSession(result.data.session);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Unable to read the sign-in session.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    const loadProfile = async () => {
      const supabase = getSupabaseClient();
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, matric_no")
        .eq("id", session.user.id)
        .maybeSingle<{ id: string; matric_no: string }>();
      if (profileError) throw profileError;
      if (data) {
        if (active) setProfileState(data);
        return;
      }

      const matricNo = session.user.user_metadata.matric_no;
      if (typeof matricNo !== "string" || !matricNo.trim()) {
        throw new Error("Your profile is missing a matric number. Sign in again and provide it.");
      }
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: session.user.id, matric_no: matricNo.trim().toUpperCase() })
        .select("id, matric_no")
        .single<{ id: string; matric_no: string }>();
      if (insertError) throw insertError;
      if (active) setProfileState(insertedProfile);
    };
    void loadProfile().catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to load your profile.");
    });
    return () => { active = false; };
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    profile: session && profileState?.id === session.user.id ? profileState : null,
    loading,
    error,
    signOut: async () => {
      const { error: signOutError } = await getSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;
    },
  }), [session, profileState, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
