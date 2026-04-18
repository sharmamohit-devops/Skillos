import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Upload, FileText, TrendingUp, Target, Users, Sparkles,
  BarChart3, Clock, History, LogOut, MessageSquare,
  MapPin, Mail, Briefcase, LayoutDashboard, ChevronLeft,
  ChevronRight, Crown, Zap, Shield, ArrowRight, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FileUploadCard from '@/components/FileUploadCard';
import JDInputCard from '@/components/JDInputCard';
import TimeCommitmentCard from '@/components/TimeCommitmentCard';
import SimulationLoader from '@/components/simulation/SimulationLoader';
import { extractTextFromFile } from '@/lib/extractText';
import type { AnalysisResult } from '@/types/analysis';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Analysis state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [showSimulation, setShowSimulation] = useState(false);
  const [resumeTextForSim, setResumeTextForSim] = useState("");
  const [jdTextForSim, setJdTextForSim] = useState("");

  // Dashboard data
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageScore: 0,
    skillsTracked: 0,
    lastAnalysis: null as Date | null
  });

  useEffect(() => {
    const userId = currentUser?.uid || 'demo-user-uid';
    const savedHistory = localStorage.getItem(`analysis_history_${userId}`);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setAnalysisHistory(history);
      
      if (history.length > 0) {
        const totalScore = history.reduce((sum: number, analysis: any) => sum + (analysis.overall_score || 0), 0);
        const avgScore = Math.round(totalScore / history.length);
        const allSkills = new Set();
        history.forEach((analysis: any) => {
          analysis.skill_analysis?.matched_skills?.forEach((skill: string) => allSkills.add(skill));
          analysis.skill_analysis?.missing_skills?.forEach((skill: string) => allSkills.add(skill));
        });
        
        setStats({
          totalAnalyses: history.length,
          averageScore: avgScore,
          skillsTracked: allSkills.size,
          lastAnalysis: new Date(history[0].createdAt)
        });
      }
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out", description: "See you next time!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast({ title: "Resume required", description: "Please upload your resume first", variant: "destructive" });
      return;
    }

    const hasJD = Boolean(jdFile) || jdText.trim().length > 20;
    if (!hasJD) {
      toast({ title: "Job description required", description: "Please upload JD file or paste JD text", variant: "destructive" });
      return;
    }

    try {
      const resumeText = await extractTextFromFile(resumeFile);
      if (resumeText.trim().length < 20) throw new Error("Resume text could not be read properly");

      const finalJdText = jdFile ? await extractTextFromFile(jdFile) : jdText.trim();
      if (finalJdText.trim().length < 20) throw new Error("Job description text could not be read properly");

      setResumeTextForSim(resumeText);
      setJdTextForSim(finalJdText);
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
      const userId = currentUser?.uid || 'demo-user-uid';
      const analysisWithMetadata = { ...result, id: Date.now().toString(), createdAt: new Date().toISOString(), userId, weeklyHours };
      
      const currentHistory = [analysisWithMetadata, ...analysisHistory].slice(0, 10);
      setAnalysisHistory(currentHistory);
      localStorage.setItem(`analysis_history_${userId}`, JSON.stringify(currentHistory));
      
      navigate("/results", { state: { result: result as AnalysisResult, weeklyHours, fromDashboard: true } });
    }
  };

  const hasJD = Boolean(jdFile) || jdText.trim().length > 20;
  const canAnalyze = Boolean(resumeFile) && hasJD;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const sidebarItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/virtual-hr', label: 'Virtual HR Comments', icon: MessageSquare },
    { path: '/match-roadmap', label: 'Resume JD Match', icon: MapPin },
    { path: '/tailored-email', label: 'Tailored Email', icon: Mail },
    { path: '/job-suggestions', label: 'Job Suggestions', icon: Briefcase },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isDemoUser = !currentUser || currentUser?.email?.includes('demo');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-card border-r border-border flex-shrink-0 overflow-hidden"
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg font-display">SkillOS</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center mx-auto">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8">
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <Button variant="ghost" onClick={handleLogout} className={`flex items-center gap-3 justify-start text-muted-foreground hover:text-foreground ${sidebarOpen ? '' : 'px-2'}`}>
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold font-display">Welcome back, {currentUser?.displayName?.split(' ')[0] || 'there'}! 👋</h1>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(currentUser?.displayName || currentUser?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{currentUser?.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-8 overflow-auto">
          {showSimulation && (
            <SimulationLoader 
              resumeText={resumeTextForSim} 
              jobDescription={jdTextForSim} 
              onComplete={handleSimulationComplete} 
            />
          )}

          {/* Welcome Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome to SkillOS, {currentUser?.displayName?.split(' ')[0] || 'there'}! 👋</h2>
                    <p className="text-muted-foreground">Your AI-powered career companion. Analyze resumes, get HR feedback, and find your dream job.</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Analyses</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-blue-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">{stats.totalAnalyses}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.lastAnalysis ? `Last: ${stats.lastAnalysis.toLocaleDateString()}` : 'No analyses yet'}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Average Score</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-green-500" /></div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold font-display ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">Across all analyses</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Skills Tracked</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Zap className="h-5 w-5 text-purple-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">{stats.skillsTracked}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique skills analyzed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">HR Panel</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Shield className="h-5 w-5 text-amber-500" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display">4</div>
                <p className="text-xs text-muted-foreground mt-1">AI agents ready</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content - Demo User: Show Last Analysis Only */}
          {isDemoUser ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="shadow-xl border-primary/10">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <History className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Last Analysis</CardTitle>
                      <CardDescription className="text-sm">View your most recent resume analysis results</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {analysisHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 font-display">No Analysis Yet</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        You haven't performed any resume analysis yet. Start your first analysis to see results here.
                      </p>
                      <Button onClick={() => navigate('/virtual-hr')} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-8 py-3 h-auto text-base" size="lg">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Virtual HR Analysis
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(() => {
                        const analysis = analysisHistory[0];
                        return (
                          <div className="border-2 rounded-2xl p-8 bg-gradient-to-br from-background to-muted/20 hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between mb-6">
                              <div>
                                <h4 className="text-xl font-bold font-display mb-2">{analysis.job_analysis?.role || 'Resume Analysis'}</h4>
                                <p className="text-muted-foreground">
                                  {new Date(analysis.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                              <div className={`text-4xl font-bold font-display ${getScoreColor(analysis.overall_score || 0)}`}>
                                {analysis.overall_score || 0}%
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Matched</p>
                                <p className="text-2xl font-bold text-green-500">{analysis.skill_analysis?.matched_skills?.length || 0}</p>
                                <p className="text-xs text-green-600">skills</p>
                              </div>
                              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Missing</p>
                                <p className="text-2xl font-bold text-red-500">{analysis.skill_analysis?.missing_skills?.length || 0}</p>
                                <p className="text-xs text-red-600">skills</p>
                              </div>
                              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Verdict</p>
                                <p className="text-lg font-bold text-blue-600">{analysis.verdict || 'N/A'}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Shortlist</p>
                                <p className="text-2xl font-bold text-purple-600">{analysis.shortlist_probability || 0}%</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Button onClick={() => navigate("/results", { state: { result: analysis, weeklyHours: analysis.weeklyHours || 20, fromDashboard: true } })} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                                <FileText className="mr-2 h-4 w-4" />View Full Report
                              </Button>
                              <Button variant="outline" onClick={() => navigate("/roadmap", { state: { result: analysis, weeklyHours: analysis.weeklyHours || 20 } })}>
                                <Target className="mr-2 h-4 w-4" />View Roadmap
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Regular User - Show Tabs with New Analysis and History */
            <Tabs defaultValue="analyze" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="analyze" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Upload className="mr-2 h-4 w-4" />New Analysis
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <History className="mr-2 h-4 w-4" />Analysis History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analyze" className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="shadow-xl border-primary/10">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold">Resume Analysis</CardTitle>
                          <CardDescription className="text-sm">Upload your resume and job description to get instant feedback from our virtual HR panel</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FileUploadCard label="Resume" description="Upload PDF, DOC, or DOCX file" file={resumeFile} onFileChange={setResumeFile} />
                        <JDInputCard file={jdFile} onFileChange={setJdFile} text={jdText} onTextChange={setJdText} />
                      </div>
                      <div className="max-w-md mx-auto">
                        <TimeCommitmentCard value={weeklyHours} onChange={setWeeklyHours} />
                      </div>
                      <div className="flex justify-center">
                        <Button onClick={handleAnalyze} disabled={!canAnalyze} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-10 py-4 h-auto text-base shadow-lg" size="lg">
                          <Sparkles className="mr-2 h-5 w-5" />Start Virtual HR Analysis<ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="shadow-xl border-primary/10">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <History className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold">Analysis History</CardTitle>
                          <CardDescription className="text-sm">View your previous resume analyses and track your progress</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      {analysisHistory.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3 font-display">No Analyses Yet</h3>
                          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Start your first resume analysis to see results here.
                          </p>
                          <Button onClick={() => {}} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-8 py-3 h-auto text-base" size="lg">
                            <Sparkles className="mr-2 h-5 w-5" />Start Analysis<ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analysisHistory.map((analysis, index) => (
                            <motion.div key={analysis.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold">{analysis.job_analysis?.role || 'Resume Analysis'}</h4>
                                  <p className="text-sm text-muted-foreground">{new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className={getScoreColor(analysis.overall_score || 0)}>{analysis.overall_score || 0}% Match</Badge>
                                  {analysis.simulation_source === 'mirrorfish' && <Badge variant="outline" className="text-purple-500 border-purple-500">MirrorFish</Badge>}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Matched Skills</p>
                                  <p className="font-semibold text-green-500">{analysis.skill_analysis?.matched_skills?.length || 0}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Missing Skills</p>
                                  <p className="font-semibold text-red-500">{analysis.skill_analysis?.missing_skills?.length || 0}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Verdict</p>
                                  <p className="font-semibold">{analysis.verdict || 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Shortlist</p>
                                  <p className="font-semibold">{analysis.shortlist_probability || 0}%</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => navigate("/results", { state: { result: analysis, weeklyHours: analysis.weeklyHours || 20, fromDashboard: true } })}>
                                  <FileText className="mr-2 h-4 w-4" />View Details
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => navigate("/roadmap", { state: { result: analysis, weeklyHours: analysis.weeklyHours || 20 } })}>
                                  <Target className="mr-2 h-4 w-4" />View Roadmap
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
