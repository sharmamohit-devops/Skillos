import { motion } from "framer-motion";
import { ArrowDown, ChevronDown } from "lucide-react";

interface LandingHeroProps {
  onGetStarted: () => void;
}

const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden dot-pattern">
      {/* Sparkles */}
      <div className="absolute top-20 left-[12%] text-orange sparkle text-xl">✦</div>
      <div className="absolute top-28 right-[10%] text-teal sparkle sparkle-delay-1 text-sm">✦</div>
      <div className="absolute bottom-44 left-[6%] text-accent sparkle sparkle-delay-2 text-base">✦</div>
      <div className="absolute bottom-36 right-[18%] text-orange/60 sparkle sparkle-delay-3 text-lg">✦</div>
      <div className="absolute top-1/3 right-[5%] text-teal/40 sparkle-pulse text-xs">✦</div>

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-orange/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-8">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-body text-[2.5rem] sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.15]"
        >
          Smart Career <span className="text-gradient-orange font-display italic">Gap Analysis</span>{" "}
          <span className="relative inline-block font-display italic font-bold">
            Platform
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 C40 2, 80 2, 120 4 S170 7, 198 3" stroke="hsl(var(--teal))" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground font-body max-w-lg mx-auto leading-relaxed"
        >
          AI-powered skill matching and personalized learning roadmaps to bridge your career gaps.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14"
        >
          <button
            onClick={onGetStarted}
            className="px-12 py-4 text-base font-body font-semibold rounded-2xl text-primary-foreground transition-all duration-300 group hover-lift shimmer-btn bg-gradient-to-r from-primary via-purple-600 to-primary shadow-glow focus-ring"
            aria-label="Start checking your resume"
          >
            Check Resume
            <ArrowDown className="w-4 h-4 ml-2 inline group-hover:translate-y-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="text-xs font-body">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 bounce-down" />
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
