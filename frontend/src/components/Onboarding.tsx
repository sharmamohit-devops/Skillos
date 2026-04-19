import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Linkedin, Github, Sparkles, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { extractTextFromFile } from '@/lib/extractText';
import { analyzeWithMirrorFish } from '@/lib/mirrorfish';
import FileUploadCard from './FileUploadCard';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { saveProfile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSaveAndAnalyze = async () => {
    if (!resumeFile) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Extract text from resume
      const resumeText = await extractTextFromFile(resumeFile);
      
      if (resumeText.trim().length < 20) {
        throw new Error('Resume text could not be read properly');
      }

      // Convert file to base64 for storage
      const base64File = await fileToBase64(resumeFile);

      // Save profile data
      await saveProfile({
        resumeFile: base64File,
        resumeText,
        linkedInUrl,
        githubUrl,
      });

      toast({
        title: 'Profile Saved',
        description: 'Analyzing your resume...',
      });

      // Auto-analyze resume using MirrorFish
      setIsAnalyzing(true);
      
      try {
        const analysisResult = await analyzeWithMirrorFish(resumeText, '', 20);
        
        // Save analysis result
        await updateProfile({
          lastAnalysis: analysisResult,
          skills: analysisResult.candidate_profile?.skills || [],
        });

        toast({
          title: 'Analysis Complete',
          description: 'Your resume has been analyzed successfully!',
        });

        onComplete();
      } catch (analysisError) {
        console.error('Auto-analysis error:', analysisError);
        // Don't block onboarding if analysis fails
        toast({
          title: 'Profile Saved',
          description: 'Resume saved. You can analyze it later from the dashboard.',
        });
        onComplete();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="shadow-xl border-primary/10">
          <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-purple-600/5">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold font-display">
              Welcome to SkillOS
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Let's get started by setting up your profile. This helps us provide personalized insights.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload Your Resume *
              </Label>
              <FileUploadCard
                label="Resume"
                description="PDF, DOC, or DOCX (Required)"
                file={resumeFile}
                onFileChange={setResumeFile}
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-base font-medium flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn Profile URL
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="h-12"
              />
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="github" className="text-base font-medium flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Profile URL
              </Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/yourusername"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSaveAndAnalyze}
              disabled={!resumeFile || isSaving || isAnalyzing}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 rounded-xl shadow-lg shadow-primary/25"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Resume...
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Your data is securely stored and used only for providing personalized career insights.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
