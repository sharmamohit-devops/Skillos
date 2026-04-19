import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Briefcase, MapPin, DollarSign, Sparkles, ExternalLink, Bookmark, BookmarkCheck, Clock, Building2, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/contexts/UserProfileContext';
import FileUploadCard from '@/components/FileUploadCard';
import { extractTextFromFile } from '@/lib/extractText';
import { generateJobSuggestions } from '@/lib/gemini';

interface JobSuggestion {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore: number;
  requiredSkills: string[];
  description: string;
  postedDate: string;
  applyUrl: string;
  isSaved: boolean;
}

const JobSuggestions = () => {
  const { profile, hasResume } = useUserProfile();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobs, setJobs] = useState<JobSuggestion[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { toast } = useToast();
  
  // Use saved resume from profile if available
  const effectiveResumeText = profile?.resumeText || '';

  // Sample job data - in production, this would come from job APIs
  const sampleJobs: Omit<JobSuggestion, 'matchScore' | 'isSaved'>[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote / San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      description: 'We are looking for an experienced Frontend Developer to join our growing team. You will work on exciting projects using modern technologies.',
      postedDate: '2 days ago',
      applyUrl: '#',
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary: '$100k - $140k',
      type: 'Full-time',
      requiredSkills: ['JavaScript', 'Python', 'AWS', 'React'],
      description: 'Join our fast-paced startup as a Full Stack Engineer. Work on cutting-edge products and grow with the company.',
      postedDate: '1 week ago',
      applyUrl: '#',
    },
    {
      id: '3',
      title: 'Software Development Engineer',
      company: 'InnovateTech',
      location: 'Seattle, WA',
      salary: '$130k - $180k',
      type: 'Full-time',
      requiredSkills: ['Java', 'Spring Boot', 'React', 'Docker'],
      description: 'Looking for a talented SDE to help build scalable solutions. Great benefits and growth opportunities.',
      postedDate: '3 days ago',
      applyUrl: '#',
    },
    {
      id: '4',
      title: 'Frontend Team Lead',
      company: 'DesignPro Agency',
      location: 'Remote',
      salary: '$140k - $170k',
      type: 'Full-time',
      requiredSkills: ['React', 'Leadership', 'UI/UX', 'Agile'],
      description: 'Lead a team of frontend developers working on enterprise projects. Strong technical and leadership skills required.',
      postedDate: '5 days ago',
      applyUrl: '#',
    },
    {
      id: '5',
      title: 'React Native Developer',
      company: 'MobileFirst Apps',
      location: 'Austin, TX',
      salary: '$110k - $150k',
      type: 'Contract',
      requiredSkills: ['React Native', 'TypeScript', 'iOS', 'Android'],
      description: 'Develop cross-platform mobile applications for our clients. Exciting projects in health and fintech sectors.',
      postedDate: '1 day ago',
      applyUrl: '#',
    },
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

    setIsAnalyzing(true);
    setJobs([]);
    setAnalysisComplete(false);

    try {
      if (resumeText.trim().length < 20) {
        throw new Error('Resume text could not be read properly');
      }

      // Generate job suggestions using Gemini
      const suggestedJobs = await generateJobSuggestions(resumeText);

      // Map the Gemini response to our JobSuggestion interface
      const matchedJobs: JobSuggestion[] = suggestedJobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: 'Full-time',
        matchScore: job.matchScore,
        requiredSkills: job.skills,
        description: job.description,
        postedDate: job.postedDate,
        applyUrl: job.url || '#',
        isSaved: savedJobs.includes(job.id),
      }));

      // Sort by match score (highest first)
      matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

      setJobs(matchedJobs);
      setAnalysisComplete(true);
      
      toast({
        title: 'Analysis Complete',
        description: `Found ${matchedJobs.length} matching jobs based on your resume`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast({
        title: 'Analysis failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSaved = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      
      toast({
        title: prev.includes(jobId) ? 'Job unsaved' : 'Job saved',
        description: prev.includes(jobId) ? 'Job removed from saved list' : 'Job added to saved list',
      });
      
      return newSaved;
    });

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      )
    );
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Great Match';
    if (score >= 60) return 'Good Match';
    return 'Low Match';
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
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Job Suggestions</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Upload your resume and discover job opportunities that match your skills
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="shadow-xl border-primary/10 mb-8">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Resume Upload</CardTitle>
                <CardDescription className="text-sm">Upload your resume to get personalized job suggestions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <FileUploadCard
              label="Resume"
              description="Upload PDF, DOC, or DOCX file"
              file={resumeFile}
              onFileChange={setResumeFile}
            />

            <Button
              onClick={handleAnalyze}
              disabled={!resumeFile || isAnalyzing}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 h-12 text-base font-semibold rounded-xl shadow-lg px-8"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Find Matching Jobs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-display">Recommended Jobs</h2>
              </div>
              <Badge variant="outline" className="px-4 py-1.5 text-base font-medium">
                Found {jobs.length} matching opportunities
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all border-border/50">
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Left: Company Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center shrink-0">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>

                        {/* Middle: Job Details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start gap-3 mb-3">
                            <h3 className="font-bold text-xl font-display">{job.title}</h3>
                            <Badge className={`${getMatchColor(job.matchScore)} px-3 py-1 text-sm font-semibold`}>
                              {job.matchScore}% {getMatchLabel(job.matchScore)}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                              <Clock className="h-4 w-4" />
                              {job.postedDate}
                            </span>
                          </div>

                          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-2">
                            {job.requiredSkills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaveJob(job.id)}
                            className="rounded-xl h-10 px-4"
                          >
                            {job.isSaved ? (
                              <>
                                <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Bookmark className="mr-2 h-4 w-4" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => window.open(job.applyUrl, '_blank')}
                            className="rounded-xl h-10 px-4 bg-gradient-to-r from-primary to-purple-600"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {analysisComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20"
              >
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> These suggestions are based on your resume skills. 
                  The more complete your resume, the better the matches. Consider updating your 
                  resume with all relevant skills and experiences.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!jobs.length && !isAnalyzing && (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Jobs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your resume and click "Find Matching Jobs" to discover opportunities
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default JobSuggestions;
