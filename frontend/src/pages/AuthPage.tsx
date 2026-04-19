import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const { login, signup, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in"
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
      toast({
        title: "Account created!",
        description: "Welcome to SkillOS"
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully logged in with Google"
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Failed to login with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Demo account credentials
      const demoEmail = "demo@skillos.com";
      const demoPassword = "demo123456";
      
      // Try to login with demo account
      await login(demoEmail, demoPassword);
      
      // Redirect to dashboard after demo login
      navigate('/dashboard');
      
      // Add demo analysis data to localStorage
      const demoAnalysisHistory = [
        {
          id: "demo-1",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          userId: "demo-user-uid",
          weeklyHours: 25,
          candidate_profile: {
            name: "Alex Johnson",
            education: "Bachelor's in Computer Science",
            domains: ["Web Development", "Software Engineering"],
            skills: ["React", "Node.js", "Python", "JavaScript", "TypeScript", "MongoDB", "Git"],
            projects: ["E-commerce Platform", "Task Management App", "Real-time Chat"],
            experience: "3 years of full-stack development"
          },
          job_analysis: {
            role: "Senior Frontend Developer",
            required_skills: ["React", "TypeScript", "Redux", "CSS3", "Jest", "GraphQL", "Next.js"],
            tech_stack: ["React", "TypeScript", "Redux", "GraphQL"],
            experience_required: "4+ years",
            domains: ["Frontend Development"]
          },
          skill_analysis: {
            matched_skills: ["React", "TypeScript", "JavaScript"],
            missing_skills: ["Redux", "Jest", "GraphQL", "Next.js"],
            partial_skills: ["CSS3"],
            skill_match_percentage: 43
          },
          evaluation: {
            match_score: 72,
            strengths: ["Strong React experience", "Good JavaScript fundamentals", "Full-stack background"],
            weaknesses: ["Missing state management experience", "No testing framework knowledge"],
            risk_factors: ["Limited senior-level experience"]
          },
          agent_reports: {
            ats: {
              agent: "ats",
              name: "ATLAS",
              role: "ATS System",
              verdict: "PASS",
              confidence: 78,
              comment: "Resume format excellent, good keyword matches for React and JavaScript roles"
            },
            hr: {
              agent: "hr",
              name: "PRIYA", 
              role: "HR Screener",
              verdict: "SHORTLIST",
              confidence: 75,
              comment: "Strong cultural fit indicators, shows growth mindset and learning ability"
            },
            startup: {
              agent: "startup",
              name: "ALEX",
              role: "Startup HM",
              verdict: "MAYBE",
              confidence: 68,
              comment: "Good execution potential but needs more senior-level experience for this role"
            },
            tech: {
              agent: "tech",
              name: "DR. CHEN",
              role: "Technical Lead", 
              verdict: "YES",
              confidence: 80,
              comment: "Solid technical foundation, React skills are strong, can learn missing technologies"
            }
          },
          overall_score: 75,
          shortlist_probability: 72,
          verdict: "POTENTIAL",
          panel_consensus: "3 of 4 agents recommend advancing",
          simulation_source: "ml_fallback"
        },
        {
          id: "demo-2", 
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          userId: "demo-user-uid",
          weeklyHours: 20,
          candidate_profile: {
            name: "Alex Johnson",
            education: "Bachelor's in Computer Science", 
            domains: ["Web Development", "Backend Development"],
            skills: ["Python", "Django", "PostgreSQL", "Docker", "AWS", "Git", "REST APIs"],
            projects: ["API Gateway", "Microservices Architecture", "Database Optimization"],
            experience: "3 years of backend development"
          },
          job_analysis: {
            role: "Backend Python Developer",
            required_skills: ["Python", "Django", "PostgreSQL", "Redis", "Docker", "AWS", "Celery"],
            tech_stack: ["Python", "Django", "PostgreSQL", "Redis"],
            experience_required: "3-5 years",
            domains: ["Backend Development"]
          },
          skill_analysis: {
            matched_skills: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
            missing_skills: ["Redis", "Celery"],
            partial_skills: [],
            skill_match_percentage: 71
          },
          evaluation: {
            match_score: 85,
            strengths: ["Excellent Python skills", "Strong Django experience", "Good DevOps knowledge"],
            weaknesses: ["Missing caching experience", "No async task processing"],
            risk_factors: []
          },
          agent_reports: {
            ats: {
              agent: "ats",
              name: "ATLAS",
              role: "ATS System", 
              verdict: "PASS",
              confidence: 88,
              comment: "Perfect keyword alignment for Python backend role, excellent technical resume"
            },
            hr: {
              agent: "hr",
              name: "PRIYA",
              role: "HR Screener",
              verdict: "SHORTLIST", 
              confidence: 82,
              comment: "Great career progression, shows consistent growth in backend technologies"
            },
            startup: {
              agent: "startup", 
              name: "ALEX",
              role: "Startup HM",
              verdict: "HIRE",
              confidence: 90,
              comment: "Perfect fit for our backend needs, can scale systems and deliver quickly"
            },
            tech: {
              agent: "tech",
              name: "DR. CHEN", 
              role: "Technical Lead",
              verdict: "STRONG_YES",
              confidence: 87,
              comment: "Impressive technical depth, Django expertise exactly what we need"
            }
          },
          overall_score: 87,
          shortlist_probability: 89,
          verdict: "STRONG_CANDIDATE", 
          panel_consensus: "4 of 4 agents recommend advancing",
          simulation_source: "ml_fallback"
        }
      ];
      
      // Use the actual user ID from the logged in user
      const userId = currentUser?.uid || "demo-user-uid";
      localStorage.setItem(`analysis_history_${userId}`, JSON.stringify(demoAnalysisHistory));
      
      toast({
        title: "Demo Account Loaded!",
        description: "Welcome to SkillOS demo with sample analysis data"
      });
      
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Demo login failed",
        description: "Using fallback demo mode. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">SkillOS</h1>
            <p className="text-xs text-muted-foreground">Virtual HR Intelligence</p>
          </div>
        </div>

        <Card className="shadow-2xl border-primary/10 overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-none h-14">
              <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-base font-medium">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-base font-medium">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <div className="p-6">

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6 mt-0">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display mb-2">Welcome Back</h2>
                    <p className="text-muted-foreground">Sign in to your SkillOS account</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@company.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-12 h-12 text-base rounded-xl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-12 pr-12 h-12 text-base rounded-xl"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium rounded-xl border-2 hover:bg-muted/50 transition-colors"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground font-medium">Or try demo</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-12 text-base font-medium rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 text-amber-700 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all px-6"
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Try Demo Account
                    </Button>
                  </div>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-6 mt-0">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display mb-2">Create Account</h2>
                    <p className="text-muted-foreground">Join SkillOS and boost your career</p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-12 h-12 text-base rounded-xl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="name@company.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-12 h-12 text-base rounded-xl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password (min 6 characters)"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-12 pr-12 h-12 text-base rounded-xl"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 px-8"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating account...
                        </span>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 px-8"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </motion.div>
    </div>
  );
};
export default AuthPage;