import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LandingHero from "@/components/LandingHero";
import LandingHowItWorks from "@/components/LandingHowItWorks";
import LandingFeatures from "@/components/LandingFeatures";
import LandingComparison from "@/components/LandingComparison";
import LandingFooter from "@/components/LandingFooter";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleTryDemo = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div className="gradient-border">
            <div className="backdrop-blur-2xl bg-card/95 rounded-2xl px-6 h-14 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-bold font-body shimmer-btn bg-gradient-to-r from-primary to-purple-600">
                  S
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-foreground tracking-[0.24em] uppercase">SkillOS</p>
                  <p className="text-[10px] font-body uppercase tracking-[0.18em] text-muted-foreground">Virtual HR Intelligence</p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-1">
                {[
                  { label: "How It Works", target: "how-it-works" },
                  { label: "Features", target: "features" },
                  { label: "Pricing", target: "pricing" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-4 py-1.5 rounded-xl text-sm font-body text-muted-foreground hover:text-foreground hover:bg-accent/8 transition-all duration-200 focus-ring"
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <Button
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-xl font-body text-xs px-5 h-9 text-primary-foreground border-0 hover:shadow-lg transition-all shimmer-btn bg-gradient-to-r from-primary to-purple-600 focus-ring"
                  >
                    Dashboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/auth")}
                      className="rounded-xl font-body text-xs px-4 h-9 text-muted-foreground hover:text-foreground"
                    >
                      <LogIn className="w-3.5 h-3.5 mr-1.5" />
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleGetStarted}
                      className="rounded-xl font-body text-xs px-5 h-9 text-primary-foreground border-0 hover:shadow-lg transition-all shimmer-btn bg-gradient-to-r from-primary to-purple-600 focus-ring"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LandingHero onGetStarted={handleGetStarted} />

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/5 to-purple-600/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-xs font-body font-semibold text-accent uppercase tracking-[0.2em] mb-3">Ready to Start?</p>
              <h2 className="font-body text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Join Thousands of <span className="font-display italic text-gradient-orange">Job Seekers</span>
              </h2>
              <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
                Get instant feedback from our virtual HR panel, discover your skill gaps, 
                and receive personalized learning roadmaps to advance your career.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="rounded-2xl font-body px-8 py-4 text-primary-foreground border-0 hover:shadow-lg transition-all shimmer-btn bg-gradient-to-r from-primary to-purple-600 focus-ring"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={handleTryDemo}
                variant="outline"
                size="lg"
                className="rounded-2xl font-body px-8 py-4"
              >
                Try Demo Account
              </Button>
            </div>

            {!currentUser && (
              <p className="text-sm text-muted-foreground">
                No credit card required • Free forever • Get started in 30 seconds
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <LandingHowItWorks />
      <LandingFeatures />
      <LandingComparison />
      <LandingFooter />
    </div>
  );
};

export default Index;
