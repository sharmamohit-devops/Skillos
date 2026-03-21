import { motion } from "framer-motion";
import { Zap, Shield, Eye, Target } from "lucide-react";

const features = [
  { icon: Zap, title: "Smart Detection", description: "AI-powered analysis detects skill gaps and mismatches instantly.", color: "accent" },
  { icon: Target, title: "Instant Results", description: "Get comprehensive analysis in seconds. No waiting or complex setup.", color: "orange" },
  { icon: Shield, title: "100% Private", description: "Your resume is never stored or shared. All analysis happens securely.", color: "teal" },
  { icon: Eye, title: "Visual Analysis", description: "Clear visual breakdown of matched, missing, and partial skills.", color: "info" },
];

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  accent: { bg: "bg-accent/10", text: "text-accent", glow: "group-hover:shadow-[0_0_20px_hsl(252_56%_57%/0.12)]" },
  orange: { bg: "bg-orange/10", text: "text-orange", glow: "group-hover:shadow-[0_0_20px_hsl(25_95%_55%/0.12)]" },
  teal: { bg: "bg-teal/10", text: "text-teal", glow: "group-hover:shadow-[0_0_20px_hsl(170_65%_45%/0.12)]" },
  info: { bg: "bg-info/10", text: "text-info", glow: "group-hover:shadow-[0_0_20px_hsl(210_80%_55%/0.12)]" },
};

const detectTags = [
  { label: "Missing Core Skills", color: "destructive" },
  { label: "Partial Knowledge", color: "warning" },
  { label: "Tool Gaps", color: "accent" },
  { label: "Framework Gaps", color: "accent" },
  { label: "Experience Mismatch", color: "orange" },
  { label: "Domain Mismatch", color: "orange" },
  { label: "Depth Mismatch", color: "warning" },
  { label: "Tech Stack Gaps", color: "info" },
  { label: "Project Gaps", color: "teal" },
  { label: "Certification Gaps", color: "teal" },
  { label: "Soft Skill Gaps", color: "warning" },
  { label: "Industry Alignment", color: "info" },
];

const tagColorClass: Record<string, string> = {
  destructive: "border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50 hover:shadow-[0_0_12px_hsl(0_72%_55%/0.1)]",
  warning: "border-warning/30 text-warning bg-warning/5 hover:bg-warning/10 hover:border-warning/50 hover:shadow-[0_0_12px_hsl(38_90%_55%/0.1)]",
  accent: "border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 hover:border-accent/50 hover:shadow-[0_0_12px_hsl(252_56%_57%/0.1)]",
  orange: "border-orange/30 text-orange bg-orange/5 hover:bg-orange/10 hover:border-orange/50 hover:shadow-[0_0_12px_hsl(25_95%_55%/0.1)]",
  info: "border-info/30 text-info bg-info/5 hover:bg-info/10 hover:border-info/50 hover:shadow-[0_0_12px_hsl(210_80%_55%/0.1)]",
  teal: "border-teal/30 text-teal bg-teal/5 hover:bg-teal/10 hover:border-teal/50 hover:shadow-[0_0_12px_hsl(170_65%_45%/0.1)]",
};

const LandingFeatures = () => {
  return (
    <section id="features" className="py-24 px-6 dot-pattern">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <p className="text-xs font-body font-semibold text-accent uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="font-body text-3xl sm:text-4xl font-bold text-foreground">
            Why <span className="font-display italic text-gradient-orange">Awareness</span> Matters
          </h2>
          <p className="mt-3 text-muted-foreground font-body text-base max-w-lg mx-auto">
            Skill gaps spread faster than you think. Your pause before applying makes all the difference.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-14">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`rounded-2xl border border-border bg-card p-7 hover:border-accent/20 transition-all duration-400 group hover-lift glow-card ${c.glow}`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <h3 className="font-body text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* What We Detect — colorful tags with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/8 border border-accent/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-body font-semibold text-accent uppercase tracking-widest">What We Detect</span>
          </div>
          <h3 className="font-body text-xl font-bold text-foreground mb-2">All skill gap types, covered</h3>
          <p className="text-sm text-muted-foreground font-body mb-8 max-w-md mx-auto">12 different types of skill misalignment detected and categorized</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {detectTags.map((tag, i) => (
              <motion.span
                key={tag.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className={`px-4 py-2 rounded-full border text-xs font-medium font-body transition-all duration-300 cursor-default ${tagColorClass[tag.color]}`}
              >
                {tag.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingFeatures;
