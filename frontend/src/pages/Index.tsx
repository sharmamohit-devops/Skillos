import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LandingHero from "@/components/LandingHero";
import LandingHowItWorks from "@/components/LandingHowItWorks";
import LandingFeatures from "@/components/LandingFeatures";
import LandingComparison from "@/components/LandingComparison";
import LandingFooter from "@/components/LandingFooter";
import FileUploadCard from "@/components/FileUploadCard";
import JDInputCard from "@/components/JDInputCard";
import TimeCommitmentCard from "@/components/TimeCommitmentCard";
import type { AnalysisResult } from "@/types/analysis";
import { extractTextFromFile } from "@/lib/extractText";

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(20);
  const navigate = useNavigate();
  const uploadRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGetStarted = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Pehle resume upload karo.",
        variant: "destructive",
      });
      return;
    }

    const hasJD = Boolean(jdFile) || jdText.trim().length > 20;
    if (!hasJD) {
      toast({
        title: "Job description required",
        description: "JD file upload karo ya text paste karo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    

    try {
      const resumeText = await extractTextFromFile(resumeFile);
      if (resumeText.trim().length < 20) {
        throw new Error("Resume text properly read nahi ho paaya.");
      }

      const finalJdText = jdFile ? await extractTextFromFile(jdFile) : jdText.trim();
      if (finalJdText.trim().length < 20) {
        throw new Error("Job description text properly read nahi ho paaya.");
      }

      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: {
          resumeText,
          jdText: finalJdText,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      navigate("/results", { state: { result: data as AnalysisResult, weeklyHours } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({
        title: "Analysis failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasJD = Boolean(jdFile) || jdText.trim().length > 20;
  const canAnalyze = Boolean(resumeFile) && hasJD && !isLoading;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div className="gradient-border">
            <div className="backdrop-blur-2xl bg-card/95 rounded-2xl px-6 h-14 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground text-sm font-bold font-body shimmer-btn bg-gradient-to-r from-primary to-purple-600"
                >
                  G
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-foreground tracking-[0.24em] uppercase">GapLens</p>
                  <p className="text-[10px] font-body uppercase tracking-[0.18em] text-muted-foreground">AI Skill Intelligence</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                {[
                  { label: "How It Works", target: "how-it-works" },
                  { label: "Features", target: "features" },
                  { label: "Check Resume", target: "upload" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth" })}
                    className="px-4 py-1.5 rounded-xl text-sm font-body text-muted-foreground hover:text-foreground hover:bg-accent/8 transition-all duration-200 focus-ring"
                    aria-label={`Navigate to ${item.label} section`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                onClick={handleGetStarted}
                className="rounded-xl font-body text-xs px-5 h-9 text-primary-foreground border-0 hover:shadow-lg transition-all shimmer-btn bg-gradient-to-r from-primary to-purple-600 focus-ring"
                aria-label="Start analyzing your resume now"
              >
                Start Now
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <LandingHero onGetStarted={handleGetStarted} />

      <section ref={uploadRef} id="upload" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-body font-semibold text-accent uppercase tracking-[0.2em] mb-3">Try It Now</p>
            <h2 className="font-body text-3xl sm:text-4xl font-bold text-foreground">
              Check Your <span className="font-display italic text-gradient-orange">Resume</span>
            </h2>
            <p className="mt-3 text-muted-foreground font-body text-base max-w-xl mx-auto">
              Resume upload karo aur JD file ya text do — AI match, missing skills, charts, aur exportable report milegi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-10">
            <FileUploadCard
              label="Resume"
              description="Resume ke liye sirf PDF, DOC, ya DOCX file upload karo"
              file={resumeFile}
              onFileChange={setResumeFile}
            />
            <JDInputCard file={jdFile} onFileChange={setJdFile} text={jdText} onTextChange={setJdText} />
          </div>

          <div className="max-w-lg mx-auto mb-10">
            <TimeCommitmentCard value={weeklyHours} onChange={setWeeklyHours} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <button
              disabled={!canAnalyze}
              onClick={handleAnalyze}
              className={`inline-flex items-center justify-center px-10 py-4 text-sm font-body font-semibold rounded-2xl text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover-lift shimmer-btn bg-gradient-to-r from-primary to-purple-600 focus-ring ${canAnalyze ? 'shadow-glow' : ''}`}
              aria-label={isLoading ? "Analyzing resume with AI" : "Start AI analysis of resume and job description"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
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
