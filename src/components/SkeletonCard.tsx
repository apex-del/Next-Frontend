import { motion } from "framer-motion";

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg bg-card overflow-hidden"
    >
      <div className="aspect-[3/4] bg-secondary animate-shimmer bg-gradient-to-r from-secondary via-muted to-secondary bg-[length:200%_100%]" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-secondary animate-shimmer bg-gradient-to-r from-secondary via-muted to-secondary bg-[length:200%_100%]" />
        <div className="h-3 w-1/2 rounded bg-secondary animate-shimmer bg-gradient-to-r from-secondary via-muted to-secondary bg-[length:200%_100%]" />
      </div>
    </motion.div>
  );
}
