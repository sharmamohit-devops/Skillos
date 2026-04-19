import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Brain, Sparkles, FileText, ArrowRight, ArrowLeft, Bot, Users, Briefcase, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import FileUploadCard from '@/components/FileUploadCard';
import SimulationLoader from '@/components/simulation/SimulationLoader';
import { extractTextFromFile } from '@/lib/extractText';
import type { AnalysisResult } from '@/types/analysis';

const VirtualHRComments = () => {
  const navigate = useNavigate();
  const { profile, hasResume } = useUserProfile();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [resumeTextForSim, setResumeTextForSim] = useState("");
  const { toast } = useToast();
  
  // Use saved resume from profile if available
  const effectiveResumeText = profile?.resumeText || resumeTextForSim;

  const agents = [
    { name: 'ATLAS', role: 'ATS System', icon: Bot, color: 'text-blue-400', description: 'Resume format and keyword screening' },
    { name: 'PRIYA', role: 'HR Screener', icon: Users, color: 'text-pink-400', description: 'Cultural fit and experience evaluation' },
    { name: 'ALEX', role: 'Startup HM', icon: Briefcase, color: 'text-orange-400', description: 'Execution potential and adaptability' },
    { name: 'DR. CHEN', role: 'Technical Lead', icon: Code, color: 'text-green-400', description: 'Technical skills and depth assessment' },
  ];

  const handleAnalyze = async () => {
    // If user has saved resume in profile, use it directly
    if (hasResume && profile?.resumeText) {
      setResumeTextForSim(profile.resumeText);
      setShowSimulation(true);
      return;
    }
    
    // Otherwise, require file upload
    if (!resumeFile) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume first or complete onboarding',
        variant: 'destructive',
      });
      return;
    }

    try {
      const resumeText = await extractTextFromFile(resumeFile);
      if (resumeText.trim().length < 20) throw new Error("Resume text could not be read properly");

      setResumeTextForSim(resumeText);
      setShowSimulation(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Analysis failed", description: message, variant: "destructive" });
    }
  };

  const handleSimulationComplete = (result: any) => {
    setShowSimulation(false);
    if (result.error) {
      toast({ title: "Analysis failed", description: result.error, variant: "destructive" });
    } else {
      navigate("/results", { state: { result: result as AnalysisResult, weeklyHours: 20, resumeOnly: true } });
    }
  };

  const canAnalyze = hasResume || Boolean(resumeFile);

  return (
    <div className="min-h-screen bg-background">
      {showSimulation && (
        <SimulationLoader 
          resumeText={resumeTextForSim} 
          jobDescription="Software Developer position requiring technical skills, problem-solving abilities, and professional experience. Looking for candidates with strong programming background and ability to work in team environments."
          onComplete={handleSimulationComplete} 
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs font-body text-primary mb-4">
            <Brain className="h-3.5 w-3.5" /> Virtual HR Panel
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Resume Review by AI Agents
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Get instant feedback on your resume from 4 specialized AI agents. No job description needed - just upload your resume for a comprehensive review.
          </p>
        </motion.div>

        {/* Agent Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.1) }}
                className="text-center p-6 rounded-2xl bg-card border border-border hover-lift shadow-card"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className={`h-6 w-6 ${agent.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {agent.name}
                </h3>
                <p className="text-sm font-body text-muted-foreground mb-2">
                  {agent.role}
                </p>
                <p className="text-xs font-body text-muted-foreground">
                  {agent.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Upload Your Resume</CardTitle>
                  <CardDescription className="text-sm">Get instant feedback from our virtual HR panel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="max-w-md mx-auto">
                <FileUploadCard 
                  label="Resume" 
                  description="Upload PDF, DOC, or DOCX file" 
                  file={resumeFile} 
                  onFileChange={setResumeFile} 
                />
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!canAnalyze} 
                  className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-10 py-4 h-auto text-base shadow-lg" 
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get HR Feedback
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            How Resume Review Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">1. Upload Resume</h3>
              <p className="text-sm font-body text-muted-foreground">
                Simply upload your resume in PDF, DOC, or DOCX format.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">2. AI Analysis</h3>
              <p className="text-sm font-body text-muted-foreground">
                4 AI agents analyze your resume from different professional perspectives.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">3. Get Feedback</h3>
              <p className="text-sm font-body text-muted-foreground">
                Receive detailed feedback and suggestions to improve your resume.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VirtualHRComments;