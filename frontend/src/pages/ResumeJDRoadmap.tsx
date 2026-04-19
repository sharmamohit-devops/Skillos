import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Target, MapPin, Sparkles, FileText, Briefcase, ArrowRight, ArrowLeft, Brain, Bot, Users, Code, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import FileUploadCard from '@/components/FileUploadCard';
import JDInputCard from '@/components/JDInputCard';
import TimeCommitmentCard from '@/components/TimeCommitmentCard';
import { extractTextFromFile } from '@/lib/extractText';
import { analyzeResumeJD } from '@/lib/pythonApi';
import type { AnalysisResult } from '@/types/analysis';

const ResumeJDRoadmap = () => {
  const navigate = useNavigate();
  const { profile, hasResume } = useUserProfile();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();
  
  // Use saved resume from profile if available
  const effectiveResumeText = profile?.resumeText || '';

  const features = [
    { 
      icon: Target, 
      title: 'Skill Gap Analysis', 
      description: 'Identify exactly which skills you need to develop',
      color: 'text-blue-500'
    },
    { 
      icon: MapPin, 
      title: 'Learning Roadmap', 
      description: 'Get a step-by-step plan to reach your career goals',
      color: 'text-green-500'
    },
    { 
      icon: Brain, 
      title: 'AI-Powered Matching', 
      description: 'Advanced algorithms analyze your resume against job requirements',
      color: 'text-purple-500'
    },
    { 
      icon: Briefcase, 
      title: 'Career Guidance', 
      description: 'Personalized recommendations based on your experience level',
      color: 'text-orange-500'
    },
  ];

  const agents = [
    { name: 'ATLAS', role: 'ATS System', icon: Bot, color: 'text-blue-400' },
    { name: 'PRIYA', role: 'HR Screener', icon: Users, color: 'text-pink-400' },
    { name: 'ALEX', role: 'Startup HM', icon: Briefcase, color: 'text-orange-400' },
    { name: 'DR. CHEN', role: 'Technical Lead', icon: Code, color: 'text-green-400' },
  ];

  const handleAnalyze = async () => {
    // Get resume text either from profile or uploaded file
    let resumeText = '';
    
    if (hasResume && profile?.resumeText) {
      resumeText = profile.resumeText;
    } else if (resumeFile) {
      resumeText = await extractTextFromFile(resumeFile);
    } else {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume first or complete onboarding',
        variant: 'destructive',
      });
      return;
    }

    const hasJD = Boolean(jdFile) || jdText.trim().length > 20;
    if (!hasJD) {
      toast({
        title: 'Job Description Required',
        description: 'Please upload JD file or paste JD text',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      const finalJdText = jdFile ? await extractTextFromFile(jdFile) : jdText.trim();
      if (finalJdText.trim().length < 20) throw new Error("Job description text could not be read properly");
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Enrich profile with GitHub and LinkedIn data if available
      let enrichedResumeText = resumeText;
      if (profile?.githubUrl || profile?.linkedInUrl) {
        try {
          const { enrichProfile } = await import('@/lib/pythonApi');
          const enriched = await enrichProfile({
            resume_text: resumeText,
            github_url: profile.githubUrl,
            linkedin_url: profile.linkedInUrl
          });
          enrichedResumeText = enriched.resume_text;
          
          toast({
            title: 'Profile Enriched',
            description: `Added ${enriched.additional_skills.length} skills from GitHub and ${enriched.projects.length} projects`,
          });
        } catch (enrichError) {
          console.error('Profile enrichment failed:', enrichError);
          // Continue with original resume text
        }
      }
      
      // Call Python backend API
      const result = await analyzeResumeJD({
        resume_text: enrichedResumeText,
        jd_text: finalJdText
      });
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Navigate to results with the Python backend data
      navigate("/results", { state: { result: result as AnalysisResult, weeklyHours, resumeOnly: false } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Analysis failed", description: message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const hasJD = Boolean(jdFile) || jdText.trim().length > 20;
  const canAnalyze = (hasResume || Boolean(resumeFile)) && hasJD;

  return (
    <div className="min-h-screen bg-background">
      {isAnalyzing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analyzing Resume & JD</h3>
              <p className="text-muted-foreground mb-4">Our AI agents are reviewing your profile against the job requirements...</p>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{analysisProgress}% complete</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs font-body text-primary mb-4">
            <Target className="h-3.5 w-3.5" /> Resume-JD Analysis
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Resume vs Job Description Match
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-3xl mx-auto">
            Upload your resume and target job description to get detailed skill gap analysis, personalized learning roadmap, and feedback from our virtual HR panel.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.1) }}
                className="text-center p-6 rounded-2xl bg-card border border-border hover-lift shadow-card"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  {feature.description}
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
                  <CardTitle className="text-xl font-bold">Start Analysis & Get Roadmap</CardTitle>
                  <CardDescription className="text-sm">Upload your resume and job description to begin comprehensive analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FileUploadCard 
                  label="Resume" 
                  description="Upload PDF, DOC, or DOCX file" 
                  file={resumeFile} 
                  onFileChange={setResumeFile} 
                />
                <JDInputCard 
                  file={jdFile} 
                  onFileChange={setJdFile} 
                  text={jdText} 
                  onTextChange={setJdText} 
                />
              </div>
              
              <div className="max-w-md mx-auto">
                <TimeCommitmentCard value={weeklyHours} onChange={setWeeklyHours} />
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!canAnalyze} 
                  className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-10 py-4 h-auto text-base shadow-lg" 
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze & Generate Roadmap
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Virtual HR Panel Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              What You'll Get
            </h2>
            <p className="text-muted-foreground font-body">
              Comprehensive analysis from multiple perspectives
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Analysis Results */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <span className="text-sm font-body">Skill match percentage</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="h-2 w-2 rounded-full bg-warning"></div>
                  <span className="text-sm font-body">Missing skills identification</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-info/10 border border-info/20">
                  <div className="h-2 w-2 rounded-full bg-info"></div>
                  <span className="text-sm font-body">Experience level assessment</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-body">Personalized learning roadmap</span>
                </div>
              </CardContent>
            </Card>

            {/* Virtual HR Panel */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Virtual HR Panel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {agents.map((agent) => {
                    const Icon = agent.icon;
                    return (
                      <div key={agent.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className={`h-4 w-4 ${agent.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            How Resume-JD Analysis Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">1. Upload Files</h3>
              <p className="text-sm font-body text-muted-foreground">
                Upload your resume and target job description.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">2. AI Analysis</h3>
              <p className="text-sm font-body text-muted-foreground">
                Advanced ML algorithms analyze skill gaps and compatibility.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">3. Get Results</h3>
              <p className="text-sm font-body text-muted-foreground">
                Receive detailed match analysis and HR feedback.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">4. Follow Roadmap</h3>
              <p className="text-sm font-body text-muted-foreground">
                Get personalized learning path to bridge skill gaps.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeJDRoadmap;