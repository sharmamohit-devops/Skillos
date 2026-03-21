import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const LandingComparison = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body font-semibold text-accent uppercase tracking-[0.2em] mb-3">The Problem We Solve</p>
          <h2 className="font-body text-3xl sm:text-4xl font-bold text-foreground">
            Why you <span className="font-display italic text-gradient-orange">need</span> SkillSync
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">😤</span>
              <h3 className="font-body font-semibold text-foreground">Without SkillSync</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Apply blindly without knowing gaps",
                "Get rejected without understanding why",
                "Waste time on irrelevant skills",
                "No idea about job alignment"
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-body text-muted-foreground">
                  <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-teal/20 bg-teal/[0.03] p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">🎯</span>
              <h3 className="font-body font-semibold text-foreground">With SkillSync</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Know exact skill gaps before applying",
                "Understand strengths and weaknesses clearly",
                "Focus learning on what matters most",
                "Apply with confidence and alignment"
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-body text-foreground">
                  <Check className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingComparison;
