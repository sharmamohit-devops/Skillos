import { motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";

interface ResultSectionProps {
  title: string;
  icon: ElementType;
  children: ReactNode;
  delay?: number;
}

const ResultSection = ({ title, icon: Icon, children, delay = 0 }: ResultSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-[1.75rem] border border-border bg-card p-6 md:p-7"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Insight Block</p>
          <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      {children}
    </motion.section>
  );
};

export default ResultSection;
