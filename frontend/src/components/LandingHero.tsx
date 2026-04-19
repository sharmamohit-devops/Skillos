import { motion } from "framer-motion";
import { ArrowDown, ChevronDown, Sparkles, Bot, Users, Briefcase, Code } from "lucide-react";

interface LandingHeroProps {
  onGetStarted: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
  const agents = [
    { name: 'ATLAS', icon: Bot, color: 'text-blue-400', position: 'top-32 left-[8%]' },
    { name: 'PRIYA', icon: Users, color: 'text-pink-400', position: 'top-40 right-[12%]' },
    { name: 'ALEX', icon: Briefcase, color: 'text-orange-400', position: 'bottom-40 left-[15%]' },
    { name: 'DR. CHEN', icon: Code, color: 'text-green-400', position: 'bottom-32 right-[10%]' },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden dot-pattern">
      {/* Enhanced Sparkles with more variety */}
      <div className="absolute top-20 left-[12%] text-orange sparkle text-xl">✦</div>
      <div className="absolute top-28 right-[10%] text-teal sparkle sparkle-delay-1 text-sm">✦</div>
      <div className="absolute bottom-44 left-[6%] text-accent sparkle sparkle-delay-2 text-base">✦</div>
      <div className="absolute bottom-36 right-[18%] text-orange/60 sparkle sparkle-delay-3 text-lg">✦</div>
      <div className="absolute top-1/3 right-[5%] text-teal/40 sparkle-pulse text-xs">✦</div>
      <div className="absolute top-1/2 left-[8%] text-purple-400/50 sparkle sparkle-delay-1 text-base">✦</div>
      <div className="absolute bottom-1/3 right-[20%] text-blue-400/40 sparkle-pulse text-sm">✦</div>

      {/* Enhanced Glow blobs with animation */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.08, 0.05]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange/5 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/3 blur-[150px] pointer-events-none" 
      />

      {/* Floating Agent Icons */}
      {agents.map((agent, index) => {
        const Icon = agent.icon;
        return (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.1, 1],
              y: [0, -10, 0]
            }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, delay: index * 0.5 },
              scale: { duration: 3, repeat: Infinity, delay: index * 0.5 },
              y: { duration: 4, repeat: Infinity, delay: index * 0.5 }
            }}
            className={`absolute ${agent.position} hidden lg:block`}
          >
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg`}>
                <Icon className={`h-6 w-6 ${agent.color}`} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
          </motion.div>
        );
      })}

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Virtual HR Panel</span>
        </motion.div>

        {/* Heading with enhanced styling */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-body text-[2.75rem] sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1]"
        >
          <span className="text-gradient-orange font-display italic">SkillOS</span>
          <br />
          <span className="relative inline-block mt-2">
            Virtual{" "}
            <span className="relative inline-block font-display italic font-bold">
              HR Intelligence
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" fill="none">
                <motion.path 
                  d="M2 6 C40 3, 80 3, 120 5 S170 8, 198 4" 
                  stroke="hsl(var(--teal))" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                />
              </svg>
            </span>
          </span>
        </motion.h1>

        {/* Enhanced Subtitle with better spacing */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-lg sm:text-xl text-muted-foreground font-body max-w-3xl mx-auto leading-relaxed"
        >
          Replace <span className="font-semibold text-foreground line-through decoration-red-500">5+ separate tools</span> with one intelligent platform.
          <br />
          <span className="font-semibold text-foreground">4 AI agents</span> analyze your resume, identify gaps, generate roadmaps, write emails, and suggest jobs — all in one place.
        </motion.p>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">4 AI Agents Active</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Instant Analysis</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-muted-foreground">Personalized Roadmap</span>
          </div>
        </motion.div>

        {/* Enhanced CTA with multiple buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="px-10 py-4 text-base font-body font-semibold rounded-2xl text-primary-foreground transition-all duration-300 group hover-lift shimmer-btn bg-gradient-to-r from-primary via-purple-600 to-primary shadow-glow focus-ring"
            aria-label="Start SkillOS analysis"
          >
            <span className="flex items-center gap-2">
              Start Free Analysis
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </span>
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-4 text-base font-body font-semibold rounded-2xl border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all duration-300 focus-ring"
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% Free Forever</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Instant Results</span>
          </div>
        </motion.div>

        {/* Scroll indicator with enhanced animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs font-body uppercase tracking-wider">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
