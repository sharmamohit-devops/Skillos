import { motion } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";

const oldTools = [
  { name: "Resume Builders", cost: "$29/mo" },
  { name: "ATS Checkers", cost: "$19/mo" },
  { name: "Career Coaches", cost: "$100+/session" },
  { name: "Job Boards", cost: "$49/mo" },
  { name: "Email Writers", cost: "$15/mo" },
  { name: "Learning Platforms", cost: "$39/mo" },
];

const skillosFeatures = [
  "Virtual HR Panel (4 AI Agents)",
  "Resume Analysis & Scoring",
  "Skill Gap Identification",
  "Personalized Learning Roadmap",
  "Tailored Job Application Emails",
  "Smart Job Recommendations",
  "Career Progress Tracking",
  "Interview Preparation Tips",
];

const LandingReplacement = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-body font-semibold text-primary uppercase tracking-[0.2em] mb-3">
            One Platform, Everything Included
          </p>
          <h2 className="font-body text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Stop juggling <span className="font-display italic text-gradient-orange">multiple tools</span>
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            SkillOS replaces expensive subscriptions and fragmented workflows with one intelligent platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Old Way - Multiple Tools */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
              OLD WAY
            </div>
            <div className="bg-card border-2 border-red-500/30 rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">Multiple Subscriptions</h3>
                  <p className="text-sm text-muted-foreground">Fragmented & Expensive</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {oldTools.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <span className="text-sm font-medium text-foreground">{tool.name}</span>
                    <span className="text-sm font-bold text-red-500">{tool.cost}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Total Monthly Cost:</span>
                  <span className="text-2xl font-bold text-red-500">$251+</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Plus time wasted switching between tools</p>
              </div>
            </div>
          </motion.div>

          {/* New Way - SkillOS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-pulse">
              NEW WAY
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/30 rounded-2xl p-8 h-full shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">SkillOS Platform</h3>
                  <p className="text-sm text-primary font-semibold">All-in-One Solution</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                {skillosFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-foreground">Your Cost:</span>
                  <span className="text-3xl font-bold text-gradient-orange">$0</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-500/10 px-3 py-2 rounded-lg">
                  <Check className="w-4 h-4" />
                  Save $3,012+ per year
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-lg font-semibold text-foreground mb-4">
            Why pay for multiple tools when you can have everything in one place?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              <span>Full Access</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingReplacement;
