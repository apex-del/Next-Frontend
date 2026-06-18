"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Download, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Mode = "signin" | "signup" | "forgot";

const SITE_KEY = "0x4AAAAAADgXqclxZv_6ufbv";
const HAS_TURNSTILE = true;

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(!HAS_TURNSTILE);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | undefined>();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isSignUp = mode === "signup";
  const isForgot = mode === "forgot";

  useEffect(() => {
    if (!HAS_TURNSTILE || typeof window === "undefined") return;
    const timeout = setTimeout(() => setTurnstileReady(true), 10000);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      clearTimeout(timeout);
      if (turnstileRef.current) {
        const id = (window as any).turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          callback: (token: string) => { setTurnstileToken(token); setTurnstileReady(true); },
        });
        turnstileWidgetId.current = id;
      }
    };
    document.head.appendChild(script);
    return () => {
      clearTimeout(timeout);
      if (turnstileWidgetId.current != null) {
        (window as any).turnstile?.remove(turnstileWidgetId.current);
      }
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!HAS_TURNSTILE) return;
    setTurnstileReady(false);
    setTurnstileToken("");
    if (turnstileWidgetId.current != null) {
      (window as any).turnstile?.remove(turnstileWidgetId.current);
      turnstileWidgetId.current = undefined;
    }
    if (typeof window !== "undefined" && turnstileRef.current && (window as any).turnstile) {
      const id = (window as any).turnstile.render(turnstileRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token: string) => { setTurnstileToken(token); setTurnstileReady(true); },
      });
      turnstileWidgetId.current = id;
    }
  }, [mode]);

  if (user) {
    router.push("/");
    return null;
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyTurnstile();
    if (!ok) {
      toast({ title: "Verification failed", description: "Could not verify you're human. Try again.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't send reset link", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setMode("signin");
    }
  };

  const verifyTurnstile = async (): Promise<boolean> => {
    if (!turnstileToken) return true;
    try {
      const verify = await fetch("/api/auth/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      if (!verify.ok) return true;
      const result = await verify.json();
      return result.success !== false;
    } catch {
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ok = await verifyTurnstile();
    if (!ok) {
      toast({ title: "Verification failed", description: "Could not verify you're human. Try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Account created!", description: "You can now sign in." });
        setMode("signin");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      else router.push("/");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src="/logo.png" alt="ApexAnime" className="h-10 w-10" />
              <span className="text-2xl font-bold">Apex<span className="text-primary">Anime</span></span>
            </div>

            <h2 className="text-xl font-bold text-center mb-1">
              {isForgot ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {isForgot
                ? "Enter your email and we'll send you a reset link"
                : isSignUp
                ? "Sign up to save favorites & track history"
                : "Sign in to continue"}
            </p>

            {isForgot ? (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required
                    className="w-full rounded-lg bg-secondary border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                </div>
                {HAS_TURNSTILE && <div ref={turnstileRef} className="flex justify-center" />}
                <button type="submit" disabled={loading || (HAS_TURNSTILE && !turnstileReady)} className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" onClick={() => setMode("signin")} className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-lg bg-white text-gray-800 hover:bg-gray-100 py-3 font-medium transition-all disabled:opacity-50 mb-4 border border-border"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name"
                        className="w-full rounded-lg bg-secondary border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required
                      className="w-full rounded-lg bg-secondary border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
                      className="w-full rounded-lg bg-secondary border border-border pl-10 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isSignUp && (
                    <div className="text-right">
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs text-muted-foreground hover:text-primary">
                        Forgot password?
                      </button>
                    </div>
                  )}
                  {HAS_TURNSTILE && <div ref={turnstileRef} className="flex justify-center" />}
                  <button type="submit" disabled={loading || (HAS_TURNSTILE && !turnstileReady)} className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => setMode(isSignUp ? "signin" : "signup")} className="text-sm text-muted-foreground hover:text-primary">
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
