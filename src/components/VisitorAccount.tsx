import React, { useEffect, useRef, useState } from "react";
import {
  hydrateSession,
  signup,
  requestPasswordRecovery,
  updateUser,
  acceptInvite,
} from "@netlify/identity";
import { X, ArrowRight, LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";

export function VisitorAccount({
  onClose,
  onSuccess,
  mode: initialMode,
  inviteToken,
}: {
  onClose: () => void;
  onSuccess: () => Promise<void>;
  mode?: "reset" | "invite";
  inviteToken?: string;
}) {
  const [mode, setMode] = useState<
    "login" | "signup" | "forgot" | "reset" | "invite"
  >(initialMode || "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = dialog.current?.querySelectorAll<HTMLElement>(
          "button, input, a[href]",
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [onClose]);
  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);
  useEffect(() => {
    setShowPassword(false);
  }, [mode]);
  useEffect(() => {
    if (mode !== "login") return;
    const controller = new AbortController();
    setLockedUntil(0);
    const timer = setTimeout(async () => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
      try {
        const response = await fetch("/.netlify/functions/portal", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "visitor-login-status", email }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (response.status === 429 && !controller.signal.aborted) {
          setNow(Date.now());
          setLockedUntil(Date.now() + data.retryAfter * 1000);
        }
      } catch {
        /* Sign-in still performs the authoritative timeout check. */
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [email, mode]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || (mode === "login" && remaining > 0)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "forgot") {
        await requestPasswordRecovery(email);
        setNotice("Check your email for a link to reset your password.");
      } else if (mode === "signup") {
        const user = await signup(email, password, { full_name: name });
        if (user.confirmedAt) await onSuccess();
        else
          setNotice(
            "Check your email to confirm your account, then return to send your enquiry. Your form stays on this page.",
          );
      } else if (mode === "reset") {
        await updateUser({ password });
        await onSuccess();
      } else if (mode === "invite" && inviteToken) {
        await acceptInvite(inviteToken, password);
        await onSuccess();
      } else {
        const response = await fetch("/.netlify/functions/portal", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "visitor-login", email, password }),
        });
        const data = await response.json();
        if (response.status === 429) {
          setNow(Date.now());
          setLockedUntil(Date.now() + data.retryAfter * 1000);
          setPassword("");
          setShowPassword(false);
        } else if (!response.ok) {
          setError(
            `${data.error || "Unable to sign in."}${typeof data.attemptsRemaining === "number" ? ` ${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? "" : "s"} remaining.` : ""}`,
          );
        } else {
          await hydrateSession();
          await onSuccess();
        }
      }
    } catch {
      setError(
        mode === "login"
          ? "Unable to sign in. Check your email and password, and confirm your email first."
          : "Unable to complete this request. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const title =
    mode === "signup"
      ? "Your private conversation starts here."
      : mode === "forgot"
        ? "Reset your password."
        : ["reset", "invite"].includes(mode)
          ? "Choose your password."
          : "Welcome back.";
  return (
    <div className="fixed inset-0 z-[200] bg-neutral-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        className="relative w-full max-w-md rounded-2xl bg-white text-neutral-900 shadow-2xl max-h-[90vh] overflow-auto"
      >
        <div className="h-1.5 bg-[#FFD200]" />
        <button
          onClick={onClose}
          aria-label="Close account sign-in"
          className="absolute right-4 top-5 p-2 rounded-full hover:bg-neutral-100"
        >
          <X size={20} />
        </button>
        <div className="p-7 sm:p-9">
          <LockKeyhole className="mb-8" size={28} />
          <p className="text-[10px] font-bold tracking-[.2em] uppercase text-neutral-500">
            Ray White / Visitor account
          </p>
          <h2
            id="account-title"
            className="mt-3 text-3xl leading-tight font-serif"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Sign in to send enquiries, read staff replies and receive private
            notifications on any device.
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <label className="block text-sm font-semibold">
                Your name
                <input
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-3 font-normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}
            {!["reset", "invite"].includes(mode) && (
              <label className="block text-sm font-semibold">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-3 font-normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {mode !== "forgot" && (
              <label className="block text-sm font-semibold">
                Password
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={mode === "login" ? 1 : 10}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-3 font-normal"
                    style={{ paddingRight: "3rem" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-900 rounded focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                {mode !== "login" && (
                  <span className="text-xs font-normal text-neutral-500">
                    Use at least 10 characters.
                  </span>
                )}
              </label>
            )}
            {mode === "login" && remaining > 0 && (
              <p
                role="status"
                className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm text-neutral-900"
              >
                Three unsuccessful attempts. Try again in{" "}
                <span className="font-mono tabular-nums">
                  {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, "0")}
                </span>
                . You can still reset your password below.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 flex gap-2"
              >
                <Mail size={20} className="shrink-0" />
                {notice}
              </p>
            )}
            <button
              disabled={busy || (mode === "login" && remaining > 0)}
              className="w-full bg-[#FFD200] hover:bg-amber-300 rounded-lg py-3.5 font-bold flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send reset link"
                    : ["reset", "invite"].includes(mode)
                      ? "Save password"
                      : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          {["login", "signup", "forgot"].includes(mode) && (
            <div className="mt-5 flex flex-col gap-3 text-sm">
              <button
                className="text-left underline underline-offset-4"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError("");
                  setNotice("");
                }}
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
              {mode !== "signup" && (
                <button
                  className="text-left text-neutral-500"
                  onClick={() => {
                    setMode(mode === "forgot" ? "login" : "forgot");
                    setError("");
                    setNotice("");
                  }}
                >
                  {mode === "forgot"
                    ? "Back to sign in"
                    : "Forgot your password?"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
