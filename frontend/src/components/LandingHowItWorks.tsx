import { motion } from "framer-motion";
import { Upload, Brain, BarChart3, Rocket, MessageSquare, Mail, Briefcase, Target } from "lucide-react";

const steps = [
  {
    icon: Upload,
    num: "1",
    title: "Upload Resume & JD",
    description: "Upload your resume and target job description. Our AI instantly extracts and analyzes all relevant data.",
  },
  {
    icon: Brain,
    num: "2",
    title: "Virtual HR Panel Review",
    description: "4 specialized AI agents (ATS, HR, Startup HM, Tech Lead) evaluate your profile from different perspectives.",
  },
  {
    icon: BarChart3,
    num: "3",
    title: "Comprehensive Analysis",
    description: "Get detailed match scores, skill gaps, agent verdicts, strengths, weaknesses, and personalized recommendations.",
  },
  {
    icon: Rocket,
    num: "4",
    title: "Complete Career Tools",
    description: "Access learning roadmaps, tailored emails, job suggestions, and ongoing career guidance — all in one platform.",
  },
];

const features = [
  { icon: MessageSquare, label: "Virtual HR Comments", color: "text-blue-500" },
  { icon: Target, label: "Resume-JD Matching", color: "text-purple-500" },
  { icon: Mail, label: "Tailored Emails", color: "text-green-500" },
  { icon: Briefcase, label: "Job Suggestions", color: "text-orange-500" },
];

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body font-semibold text-accent uppercase tracking-[0.2em] mb-3">Complete Platform</p>
          <h2 className="font-body text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Your <span className="font-display italic text-gradient-orange">all-in-one</span> career
            <br />
            intelligence platform
          </h2>
          <p className="mt-4 text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            SkillOS manages your entire job search journey — from resume analysis to job applications, all powered by AI.
          </p>
        </motion.div>

        {/* Main Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
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
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}

                {/* Icon circle */}
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-card border-2 border-border flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-lg transition-all duration-300" style={{ boxShadow: "var(--shadow-card)" }}>
                    <Icon className="w-9 h-9 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                    {s.num}
                  </div>
                </div>

                <h3 className="font-body text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-body max-w-[240px] mx-auto leading-relaxed">{s.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Platform Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 pt-12 border-t border-border"
        >
          <div className="text-center mb-10">
            <h3 className="font-body text-2xl font-bold text-foreground mb-3">
              Everything you need in one platform
            </h3>
            <p className="text-muted-foreground font-body">
              Comprehensive tools to manage your entire job search process
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground text-center">{feature.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
