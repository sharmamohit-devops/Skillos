import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
}

const ScoreRing = ({ score, label, size = 120 }: ScoreRingProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return "hsl(var(--teal))";
    if (score >= 50) return "hsl(var(--orange))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="font-display text-2xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs font-display font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

export default ScoreRing;
