import { motion } from "framer-motion";
import { Upload, FileSearch, PieChart } from "lucide-react";

const steps = [
  { icon: Upload, num: "1", title: "Submit Resume", description: "Upload your resume PDF for instant analysis." },
  { icon: FileSearch, num: "2", title: "Instant Analysis", description: "Our AI identifies skill gaps and matches instantly." },
  { icon: PieChart, num: "3", title: "Learn Why", description: "Understand specific strengths, gaps, and risk factors." },
];

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body font-semibold text-accent uppercase tracking-[0.2em] mb-3">How It Works</p>
          <h2 className="font-body text-3xl sm:text-4xl font-bold text-foreground">
            Simple steps to build your
            <br />
            <span className="font-display italic text-gradient-orange">digital awareness</span>
          </h2>
          <p className="mt-3 text-muted-foreground font-body text-base max-w-md mx-auto">
            and protect yourself from skill misalignment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative text-center group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
              )}

              {/* Number circle */}
              <div className="relative inline-flex items-center justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-accent/40 transition-colors" style={{ boxShadow: "var(--shadow-card)" }}>
                  <span className="text-gradient-purple font-body text-2xl font-bold">{s.num}</span>
                </div>
              </div>

              <h3 className="font-body text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground font-body max-w-[220px] mx-auto">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
