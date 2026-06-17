"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFollowList } from "@/hooks/useFollows";

interface Props {
  userId: string;
  type: "followers" | "following";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FollowListDialog({ userId, type, open, onOpenChange }: Props) {
  const { data: list = [], isLoading } = useFollowList(open ? userId : undefined, type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 capitalize">
            <Users className="h-5 w-5 text-primary" /> {type}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto -mx-2 px-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No {type} yet.
            </div>
          ) : (
            <div className="space-y-1">
              {list.map((p) => (
                <Link
                  key={p.user_id}
                  href={`/profile/${p.user_id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={p.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {(p.display_name?.[0] ?? "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {p.display_name || "Unnamed user"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
