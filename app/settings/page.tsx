"use client";

import Link from "next/link";
import { Settings as SettingsIcon, User, LogOut, Shield, Bell, Cookie, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20 px-4">
          <SettingsIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to access settings</h2>
          <Link
            href="/auth"
            className="mt-4 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    router.push("/");
  };

  const togglePublicProfile = async (nextValue: boolean) => {
    setSavingPrivacy(true);
    try {
      await updateProfile.mutateAsync({ public_profile: nextValue });
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mb-8">Manage your account</p>
          </motion.div>

          <div className="space-y-4">
            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Account
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Member since</label>
                  <p className="text-sm font-medium">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Preferences
              </h3>
              <p className="text-sm text-muted-foreground">Notification and theme settings coming soon.</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Privacy
              </h3>
              <div className="rounded-xl border border-border bg-secondary/40 p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {profile?.public_profile === false ? (
                      <Lock className="h-4 w-4 text-primary" />
                    ) : (
                      <Globe className="h-4 w-4 text-primary" />
                    )}
                    Public profile
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When on, other users can open your profile page from comments and follows. When off, your profile page shows as private.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={profile?.public_profile !== false}
                  onClick={() => togglePublicProfile(profile?.public_profile === false)}
                  disabled={savingPrivacy || updateProfile.isPending}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    profile?.public_profile === false ? "bg-secondary" : "bg-primary"
                  } disabled:opacity-60`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-background transition-transform ${
                      profile?.public_profile === false ? "left-1" : "translate-x-5 left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Cookie className="h-4 w-4 text-primary" />
                Cookies & session
              </h3>
              <p className="text-sm text-muted-foreground">
                We use cookies and your session to keep you signed in, remember consent, and keep your account secure across visits.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to sign in again to access your favorites, history and watch lists.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Layout>
  );
}
