import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Linkedin, Github, Loader2, ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useToast } from '@/hooks/use-toast';
import FileUploadCard from '@/components/FileUploadCard';
import { extractTextFromFile } from '@/lib/extractText';

const EditProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState(profile?.linkedInUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setLinkedInUrl(profile.linkedInUrl || '');
      setGithubUrl(profile.githubUrl || '');
    }
  }, [profile]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const updates: any = {
        linkedInUrl,
        githubUrl,
      };

      // If user uploaded a new resume, process it
      if (resumeFile) {
        const resumeText = await extractTextFromFile(resumeFile);
        
        if (resumeText.trim().length < 20) {
          throw new Error('Resume text could not be read properly');
        }

        const base64File = await fileToBase64(resumeFile);
        updates.resumeFile = base64File;
        updates.resumeText = resumeText;
      }

      await updateProfile(updates);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully!',
      });

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            <User className="h-3.5 w-3.5" /> Edit Profile
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Update Your Profile
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Keep your resume and professional profiles up to date for better analysis results.
          </p>
        </motion.div>

        {/* Current Profile Info */}
        {profile?.resumeText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Resume Uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      Your resume is saved. Upload a new one to replace it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                  <CardDescription className="text-sm">
                    Update your resume and professional profile links
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Update Resume {!profile?.resumeText && <span className="text-red-500">*</span>}
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {profile?.resumeText 
                    ? 'Upload a new resume to replace your current one (optional)'
                    : 'Upload your resume (required)'}
                </p>
                <FileUploadCard
                  label="Resume"
                  description="PDF, DOC, or DOCX"
                  file={resumeFile}
                  onFileChange={setResumeFile}
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-600" />
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
                <p className="text-xs text-muted-foreground">
                  Add your LinkedIn profile to enhance your professional presence
                </p>
              </div>

              {/* GitHub URL */}
              <div className="space-y-2">
                <Label htmlFor="github" className="text-sm font-medium flex items-center gap-2">
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
                <p className="text-xs text-muted-foreground">
                  Showcase your coding projects and contributions
                </p>
              </div>

              {/* Save Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || (!profile?.resumeText && !resumeFile)}
                  className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 rounded-xl shadow-lg shadow-primary/25"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSaving}
                  className="h-14 px-8"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-700 mb-2">💡 Tips for Better Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Keep your resume updated with your latest skills and experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Add your LinkedIn profile to show your professional network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Include your GitHub to highlight your coding projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Updated profiles lead to more accurate AI analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
