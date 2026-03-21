import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getPaceLabel } from "@/lib/skillTimeEstimator";

interface TimeCommitmentCardProps {
  value: number;
  onChange: (hours: number) => void;
}

const QUICK_OPTIONS = [10, 15, 20, 25, 30, 35, 40];

const TimeCommitmentCard = ({ value, onChange }: TimeCommitmentCardProps) => {
  const pace = getPaceLabel(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl bg-card border border-border p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex flex-col items-center text-center space-y-5">
        {/* Icon */}
        <div className="h-14 w-14 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center">
          <Clock className="h-7 w-7 text-accent" />
        </div>

        {/* Title */}
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Weekly Time Commitment
          </h2>
          <p className="text-sm font-body text-muted-foreground mt-1.5">
            How many hours per week can you dedicate to learning?
          </p>
        </div>

        {/* Big number */}
        <div>
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="font-display text-5xl font-bold text-accent block"
          >
            {value}
          </motion.span>
          <p className="text-sm font-body text-muted-foreground mt-1">hours per week</p>
        </div>

        {/* Slider */}
        <div className="w-full max-w-sm space-y-2">
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={5}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-body text-muted-foreground">
            <span>5hrs</span>
            <span>25hrs</span>
            <span>50hrs</span>
          </div>
        </div>

        {/* Quick select */}
        <div className="space-y-2">
          <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest">
            Quick Select:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => onChange(h)}
                className={`rounded-xl px-4 py-2 text-sm font-body font-medium border transition-all active:scale-[0.96] ${
                  value === h
                    ? "bg-accent text-primary-foreground border-accent shadow-md"
                    : "bg-muted/50 text-foreground border-border hover:border-accent/30 hover:bg-accent/5"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Pace label */}
        <motion.div
          key={pace.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl bg-muted/50 border border-border px-6 py-3 w-full max-w-xs"
        >
          <p className="font-display font-bold text-foreground text-sm">
            {pace.emoji} {pace.label}
          </p>
          <p className="text-xs font-body text-muted-foreground mt-0.5">
            {pace.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimeCommitmentCard;
