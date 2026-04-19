import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Mail, Sparkles, Copy, Check, FileText, RefreshCw, Building2, User, ArrowRight, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import FileUploadCard from '@/components/FileUploadCard';
import { extractTextFromFile } from '@/lib/extractText';
import { generateTailoredEmail } from '@/lib/gemini';

interface GeneratedEmail {
  subject: string;
  body: string;
  tone: 'professional' | 'enthusiastic' | 'formal';
  highlights: string[];
}

const TailoredEmail = () => {
  const { profile, hasResume } = useUserProfile();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Use saved resume from profile if available
  const effectiveResumeText = profile?.resumeText || '';

  const handleGenerate = async () => {
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

    if (!jobDescription.trim()) {
      toast({
        title: 'Job Description Required',
        description: 'Please paste the job description',
        variant: 'destructive',
      });
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: 'Company Name Required',
        description: 'Please enter the company name',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(null);

    try {
      if (resumeText.trim().length < 20) {
        throw new Error('Resume text could not be read properly');
      }

      // Generate tailored email using Gemini
      const result = await generateTailoredEmail({
        resumeText,
        jobDescription,
        companyName,
        hiringManager: hiringManager || undefined,
        tone: 'professional',
      });

      const email: GeneratedEmail = {
        subject: result.subject,
        body: result.body,
        tone: 'professional',
        highlights: result.highlights,
      };

      setGeneratedEmail(email);
      
      toast({
        title: 'Email Generated',
        description: 'Your tailored job application email is ready',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({
        title: 'Generation failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedEmail) {
      const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
      navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Email copied to clipboard',
      });
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-background p-8 relative">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Tailored Job Application Email</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Generate a personalized email for your job application based on your resume and the job description
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-6 mb-10">
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Resume Upload</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <FileUploadCard
                label="Resume"
                description="Upload PDF, DOC, or DOCX file"
                file={resumeFile}
                onFileChange={setResumeFile}
              />
            </CardContent>
          </Card>

          <Card className="shadow-xl border-primary/10">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Job Details</CardTitle>
                  <CardDescription className="text-sm">Enter job information for a personalized email</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Company Name <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Hiring Manager <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    placeholder="e.g., John Smith"
                    value={hiringManager}
                    onChange={(e) => setHiringManager(e.target.value)}
                    className="h-12 rounded-xl text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] rounded-xl text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={!resumeFile || !jobDescription.trim() || isGenerating}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-10 py-4 h-auto text-base font-semibold rounded-xl shadow-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Crafting Your Email...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Tailored Email
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generated Email */}
        {generatedEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl border-primary/10">
              <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Generated Email</CardTitle>
                    <CardDescription className="text-sm">Review and customize before sending</CardDescription>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    className="h-10 px-4 rounded-xl"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCopy}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-purple-600"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Email
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Subject */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Subject:</p>
                  <p className="font-semibold text-lg">{generatedEmail.subject}</p>
                </div>

                {/* Email Body */}
                <div className="p-6 rounded-xl bg-muted/50 border border-border/50 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatedEmail.body}
                </div>

                {/* Highlights */}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Key highlights included:</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedEmail.highlights.map((highlight) => (
                      <Badge key={highlight} variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm font-medium">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-2 border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💡</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-blue-700 mb-2">Pro Tips:</p>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Personalize the greeting if you know the hiring manager's name</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Review and adjust the tone to match the company culture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Add specific achievements that relate to the role</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Keep it concise - aim for 200-300 words</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TailoredEmail;
