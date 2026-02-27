import { useState } from "react";
import { Flag, Send, CheckCircle, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const supabaseReports = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface ReportButtonProps {
  animeId: number;
  animeTitle: string;
  episodeNumber: number;
}

export default function ReportButton({ animeId, animeTitle, episodeNumber }: ReportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    await supabaseReports.from("reports").insert({
      user_id: user?.id || null,
      anime_id: animeId,
      anime_title: animeTitle,
      episode_number: episodeNumber,
      report_type: "broken_link",
      message: message.trim() || "Broken link reported",
    });
    setLoading(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOpen(false);
      setMessage("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Report broken link"
        >
          <Flag className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            Report Issue
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {animeTitle} — Episode {episodeNumber}
          </p>
          {sent ? (
            <div className="flex items-center gap-2 text-primary py-4 justify-center">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Report submitted. Thank you!</span>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the issue (optional)..."
                rows={3}
                maxLength={500}
                className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {loading ? "Sending..." : "Submit Report"}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
