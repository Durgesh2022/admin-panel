"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { adminClientAuth } from "@/lib/firebase-client";

type AuthMode = "login" | "signup";

export function AuthForm({
  mode,
  title,
  subtitle,
}: {
  mode: AuthMode;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSecret, setSignupSecret] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const alternateLink = useMemo(
    () =>
      mode === "login"
        ? { href: "/signup", label: "Create admin account" }
        : { href: "/login", label: "Already have an account?" },
    [mode]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(
          adminClientAuth,
          email.trim(),
          password
        );

        try {
          await updateProfile(credential.user, { displayName: name.trim() });
          const idToken = await credential.user.getIdToken();
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken,
              name: name.trim(),
              email: email.trim(),
              signupSecret: signupSecret.trim(),
            }),
          });

          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(payload.error || "Signup failed.");
          }
        } catch (error) {
          try {
            await deleteUser(credential.user);
          } catch {
            // Keep the original error, cleanup is best-effort.
          }
          throw error;
        }
      } else {
        const credential = await signInWithEmailAndPassword(
          adminClientAuth,
          email.trim(),
          password
        );
        const idToken = await credential.user.getIdToken();
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          await signOut(adminClientAuth);
          throw new Error(payload.error || "Login failed.");
        }
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Traqo Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                placeholder="Your name"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
              placeholder="admin@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
              placeholder="Minimum 6 characters"
            />
          </label>

          {mode === "signup" ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Admin signup code
              </span>
              <input
                type="password"
                value={signupSecret}
                onChange={(event) => setSignupSecret(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                placeholder="Required if ADMIN_SIGNUP_SECRET is set"
              />
            </label>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-rose-900 bg-rose-950/60 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create admin account"
                : "Login"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-400">
          <Link href={alternateLink.href} className="font-medium text-sky-300 hover:text-sky-200">
            {alternateLink.label}
          </Link>
          <Link href="/" className="hover:text-white">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
