import { motion } from "framer-motion";
import { ArrowLeft, Home, BarChart3, Route, Sparkles, Target } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EnhancedNavbarProps {
  showExport?: boolean;
  exportButton?: React.ReactNode;
}

const EnhancedNavbar = ({ showExport = false, exportButton }: EnhancedNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isResults = location.pathname === "/results";
  const isRoadmap = location.pathname === "/roadmap";

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-xl shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
              </div>
              <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SkillSync
              </span>
            </motion.div>

            {/* Breadcrumb Navigation */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-1.5"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              
              {(isResults || isRoadmap) && (
                <>
                  <span className="text-muted-foreground/50">/</span>
                  {isResults && (
                    <div className="flex items-center gap-2 text-foreground font-medium px-3 py-1.5">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Analysis Results
                    </div>
                  )}
                  {isRoadmap && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-1.5"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Results
                      </Button>
                      <span className="text-muted-foreground/50">/</span>
                      <div className="flex items-center gap-2 text-foreground font-medium px-3 py-1.5">
                        <Route className="h-4 w-4 text-primary" />
                        Learning Roadmap
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Export Button */}
            {showExport && exportButton && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {exportButton}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default EnhancedNavbar;