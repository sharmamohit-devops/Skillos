import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LandingHero from "@/components/LandingHero";
import LandingHowItWorks from "@/components/LandingHowItWorks";
import LandingReplacement from "@/components/LandingReplacement";
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
                  { label: "Why SkillOS", target: "pricing" },
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

      <LandingReplacement />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingComparison />
      <LandingFooter />
    </div>
  );
};

export default Index;
