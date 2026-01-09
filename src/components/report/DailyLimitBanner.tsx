import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";

interface DailyLimitBannerProps {
  scansToday: number;
  maxScans: number;
}

const DailyLimitBanner = ({ scansToday, maxScans }: DailyLimitBannerProps) => {
  const remaining = maxScans - scansToday;
  const isLimitReached = remaining <= 0;

  if (isLimitReached) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border-gold/30 bg-gold/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              You've reached today's scan limit
            </p>
            <p className="text-sm text-muted-foreground">
              Skin changes take time—check back tomorrow for your next analysis.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Daily Scans</p>
            <p className="text-sm text-muted-foreground">
              {remaining} scan{remaining !== 1 ? 's' : ''} remaining today
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: maxScans }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < scansToday ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyLimitBanner;
