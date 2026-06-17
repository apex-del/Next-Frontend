"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Download, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please re-enter your new password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated", description: "You can now sign in with your new password." });
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 pt-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Download className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Anime<span className="text-primary">Stream</span></span>
            </div>

            <h2 className="text-xl font-bold text-center mb-1 flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Set a new password
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Choose a strong password for your account.
            </p>

            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    minLength={6}
                    className="w-full rounded-lg bg-secondary border border-border pl-10 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className="w-full rounded-lg bg-secondary border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-6">
                This link is invalid or has expired. Please request a new reset link from the
                <button onClick={() => router.push("/auth")} className="text-primary hover:underline ml-1">sign-in page</button>.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
