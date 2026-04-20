import { AnalysisResult } from '@/types/analysis';
import { auth } from '../config/firebase';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TailoredEmailRequest {
  resumeText: string;
  jobDescription: string;
  companyName: string;
  hiringManager?: string;
  tone?: 'professional' | 'friendly' | 'formal';
}

export interface TailoredEmailResponse {
  subject: string;
  body: string;
  highlights: string[];
}

export interface JobSuggestion {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
  description: string;
  skills: string[];
  matchScore: number;
  url?: string;
}

// Internal helper to trigger background scan
async function triggerScanAndGetHash(
  resumeText: string, 
  jdText: string = '', 
  companyName?: string, 
  hiringManager?: string
): Promise<string> {
  const userId = auth?.currentUser?.uid || 'guest';
  
  const payload: any = {
    user_id: userId,
    resume_text: resumeText,
    jd_text: jdText
  };
  
  if (companyName) payload.company_name = companyName;
  if (hiringManager) payload.hiring_manager = hiringManager;

  const response = await fetch(`${BACKEND_URL}/api/background-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error('Failed to trigger background scan');
  const data = await response.json();
  return data.resume_hash;
}

async function pollBackendChunk(hash: string, chunkName: string, maxAttempts = 30): Promise<any> {
    const userId = auth?.currentUser?.uid || 'guest';

    for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(
          `${BACKEND_URL}/api/background-scan-result/${hash}/${chunkName}?user_id=${encodeURIComponent(userId)}`
        );
        if (!response.ok && response.status !== 404) {
          throw new Error(`Failed to poll chunk: ${chunkName}`);
        }

        if (response.ok) {
          const payload = await response.json();
          if (payload.status === 'ready') {
            return payload.data;
          }
          if (payload.status === 'error') {
            throw new Error(payload.error || `Chunk failed: ${chunkName}`);
          }
        }
        await new Promise(r => setTimeout(r, 2000)); // wait 2s
    }
    throw new Error('Timeout polling for chunk: ' + chunkName);
}

export async function generateTailoredEmail(request: TailoredEmailRequest): Promise<TailoredEmailResponse> {
  try {
    const hash = await triggerScanAndGetHash(request.resumeText, request.jobDescription, request.companyName, request.hiringManager);
    const data = await pollBackendChunk(hash, 'tailored_email');
    if (data.subject && data.body) {
        return {
            subject: data.subject,
            body: data.body,
            highlights: data.highlights || []
        };
    }
    return generateFallbackEmail(request);
  } catch (error) {
    console.error('Email generation error:', error);
    return generateFallbackEmail(request);
  }
}

export async function generateJobSuggestions(resumeText: string): Promise<JobSuggestion[]> {
  try {
    const hash = await triggerScanAndGetHash(resumeText, '');
    const data = await pollBackendChunk(hash, 'job_suggestions');
    if (data && data.suggestions && Array.isArray(data.suggestions)) {
        return data.suggestions.map((job: any, index: number) => ({
            ...job,
            id: job.id || `job-${index + 1}`
        }));
    }
    return generateFallbackJobSuggestions(resumeText);
  } catch (error) {
    console.error('Job suggestions error:', error);
    return generateFallbackJobSuggestions(resumeText);
  }
}

export async function analyzeResumeWithGemini(resumeText: string, jobDescription?: string): Promise<Partial<AnalysisResult>> {
  try {
      const hash = await triggerScanAndGetHash(resumeText, jobDescription || '');
      
      // Need to poll base analysis and hr simulation, or just one of them
      const baseData = await pollBackendChunk(hash, 'base_analysis');
      const hrData = await pollBackendChunk(hash, 'hr_simulation', 45); // HR simulation might take longer (45*2 = 90s max)
      
      return {
          ...baseData,
          ...hrData
      } as Partial<AnalysisResult>;
  } catch (error) {
      console.error('Analyze resume polling error:', error);
      throw error;
  }
}

// Fallbacks
function generateFallbackEmail(request: TailoredEmailRequest): TailoredEmailResponse {
  const skills = extractSkillsFromResume(request.resumeText);
  const skillText = skills.slice(0, 3).join(', ');
  
  return {
    subject: `Application for ${request.companyName} - ${skillText} Expert`,
    body: `Dear ${request.hiringManager || 'Hiring Manager'},\n\nI am writing to express my strong interest in joining ${request.companyName}. With my background in ${skillText}, I am confident that I can make valuable contributions to your team.\n\nThroughout my career, I have developed strong technical skills and a passion for delivering high-quality work. My experience aligns well with the requirements of this role, and I am eager to bring my expertise to ${request.companyName}.\n\nI would welcome the opportunity to discuss how my background and skills would be a great fit for your team. Thank you for considering my application.\n\nBest regards,\n[Your Name]`,
    highlights: [
      `Strong background in ${skillText}`,
      'Proven track record of delivering results',
      'Passionate about contributing to innovative teams'
    ]
  };
}

function extractSkillsFromResume(resumeText: string): string[] {
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL'];
  const foundSkills = commonSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  return foundSkills.length > 0 ? foundSkills : ['software development', 'problem solving', 'team collaboration'];
}

function generateFallbackJobSuggestions(resumeText: string): JobSuggestion[] {
  const skills = extractSkillsFromResume(resumeText);
  const hasReact = skills.includes('React');
  const hasNode = skills.includes('Node.js');
  const hasPython = skills.includes('Python');
  
  return [
    {
      id: '1',
      title: hasReact ? 'Frontend React Developer' : 'Software Engineer',
      company: 'TechCorp Inc.',
      location: 'Remote / San Francisco, CA',
      salary: '$95,000 - $135,000 per year',
      postedDate: 'Posted 2 days ago',
      description: 'Join our dynamic team to build cutting-edge web applications. Work with modern technologies and contribute to impactful projects.',
      skills: skills.slice(0, 4),
      matchScore: 85,
      url: 'https://example.com/job1'
    },
    {
      id: '2',
      title: hasNode ? 'Full Stack Developer' : 'Web Developer',
      company: 'StartupXYZ',
      location: 'Hybrid / New York, NY',
      salary: '$90,000 - $120,000 per year',
      postedDate: 'Posted 3 days ago',
      description: 'Fast-growing startup seeking talented developers. Great opportunity for career growth and learning.',
      skills: skills.slice(0, 3),
      matchScore: 78,
      url: 'https://example.com/job2'
    }
  ];
}
