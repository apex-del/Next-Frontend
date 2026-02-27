"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Contact() {
  const { user } = useAuth();
  const [type, setType] = useState<"bug" | "feature" | "other">("bug");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await (supabase as any).from("reports").insert({
      user_id: user?.id || null,
      report_type: type,
      message: message.trim(),
    });
    setLoading(false);
    setSubmitted(true);
    setMessage("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            <MessageSquare className="inline h-6 w-6 text-primary mr-2" />
            Contact Us
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Report bugs, request features, or send feedback.</p>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Thank you!</h2>
            <p className="text-muted-foreground text-sm mb-4">Your report has been submitted. We&apos;ll look into it.</p>
            <button onClick={() => setSubmitted(false)} className="text-sm text-primary hover:underline">Submit another</button>
          </motion.div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <div className="flex gap-2">
                {(["bug", "feature", "other"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                      type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "bug" ? "Bug" : t === "feature" ? "Feature" : "Other"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe the issue or your suggestion..."
                className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Submit Report"}
            </button>
          </motion.form>
        )}
      </div>
    </Layout>
  );
}
