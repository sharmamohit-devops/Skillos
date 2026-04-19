import { AnalysisResult } from '@/types/analysis';

const GEMINI_API_KEY = 'AIzaSyBD2SZnV-njQ8VgLsJi6ur-e3-Wkcnkgso';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export async function generateTailoredEmail(request: TailoredEmailRequest): Promise<TailoredEmailResponse> {
  const prompt = `
You are an expert career coach and professional writer. Write a compelling, personalized job application email based on the following information.

RESUME:
${request.resumeText.substring(0, 2000)}

JOB DESCRIPTION:
${request.jobDescription.substring(0, 2000)}

COMPANY: ${request.companyName}
${request.hiringManager ? `HIRING MANAGER: ${request.hiringManager}` : ''}

Write a professional email with:
1. A compelling subject line (max 60 characters)
2. A personalized body that:
   - Opens with a strong hook mentioning specific qualifications
   - Highlights 2-3 most relevant skills/experiences from the resume
   - Shows enthusiasm for the role and company
   - Includes a clear call to action
   - Keeps it concise (150-250 words)
3. 3 key selling points/highlights that make this candidate a great fit

Format the response as JSON:
{
  "subject": "email subject",
  "body": "email body with proper paragraphs",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"]
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Gemini API rate limited (429), using fallback email');
        return generateFallbackEmail(request);
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return {
      subject: result.subject,
      body: result.body,
      highlights: result.highlights || []
    };
  } catch (error) {
    console.error('Gemini email generation error:', error);
    // Return fallback email instead of throwing
    return generateFallbackEmail(request);
  }
}

// Fallback email generator when API fails
function generateFallbackEmail(request: TailoredEmailRequest): TailoredEmailResponse {
  const skills = extractSkillsFromResume(request.resumeText);
  const skillText = skills.slice(0, 3).join(', ');
  
  return {
    subject: `Application for ${request.companyName} - ${skillText} Expert`,
    body: `Dear ${request.hiringManager || 'Hiring Manager'},

I am writing to express my strong interest in joining ${request.companyName}. With my background in ${skillText}, I am confident that I can make valuable contributions to your team.

Throughout my career, I have developed strong technical skills and a passion for delivering high-quality work. My experience aligns well with the requirements of this role, and I am eager to bring my expertise to ${request.companyName}.

I would welcome the opportunity to discuss how my background and skills would be a great fit for your team. Thank you for considering my application.

Best regards,
[Your Name]`,
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

export async function generateJobSuggestions(resumeText: string): Promise<JobSuggestion[]> {
  const prompt = `
You are an expert career advisor and job matcher. Analyze the following resume and suggest 5 realistic job opportunities that would be a good fit.

RESUME:
${resumeText.substring(0, 3000)}

Based on the resume, provide 5 job suggestions in JSON format. Each job should include:
- Realistic job titles that match the candidate's experience level
- Well-known companies in relevant industries
- Locations that are commonly remote or tech hubs
- Salary ranges appropriate for the role and experience
- Key skills from the resume that match the job

Format as JSON array:
[
  {
    "id": "1",
    "title": "Job Title",
    "company": "Company Name",
    "location": "Location (Remote/On-site/Hybrid)",
    "salary": "$X - $Y per year",
    "postedDate": "Posted X days ago",
    "description": "Brief job description (2-3 sentences)",
    "skills": ["skill1", "skill2", "skill3"],
    "matchScore": 85,
    "url": "https://example.com/job"
  }
]

Make the suggestions realistic and based on actual market trends. Match score should reflect how well the resume matches the job requirements.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Gemini API rate limited (429), using fallback job suggestions');
        return generateFallbackJobSuggestions(resumeText);
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const suggestions: JobSuggestion[] = JSON.parse(jsonMatch[0]);
    return suggestions.map((job, index) => ({
      ...job,
      id: job.id || `job-${index + 1}`
    }));
  } catch (error) {
    console.error('Gemini job suggestions error:', error);
    // Return fallback suggestions instead of throwing
    return generateFallbackJobSuggestions(resumeText);
  }
}

// Fallback job suggestions when API fails
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
    },
    {
      id: '3',
      title: hasPython ? 'Python Backend Engineer' : 'Backend Developer',
      company: 'DataSystems Ltd.',
      location: 'Remote / Austin, TX',
      salary: '$100,000 - $140,000 per year',
      postedDate: 'Posted 5 days ago',
      description: 'Build scalable backend systems and APIs. Work with a talented engineering team on challenging problems.',
      skills: skills.slice(0, 4),
      matchScore: 72,
      url: 'https://example.com/job3'
    },
    {
      id: '4',
      title: 'Senior Software Engineer',
      company: 'Enterprise Solutions',
      location: 'On-site / Seattle, WA',
      salary: '$120,000 - $160,000 per year',
      postedDate: 'Posted 1 week ago',
      description: 'Lead development initiatives and mentor junior developers. Excellent benefits and compensation package.',
      skills: skills.slice(0, 3),
      matchScore: 68,
      url: 'https://example.com/job4'
    },
    {
      id: '5',
      title: 'Product Engineer',
      company: 'Innovation Labs',
      location: 'Remote / Anywhere',
      salary: '$105,000 - $145,000 per year',
      postedDate: 'Posted 1 week ago',
      description: 'Combine technical skills with product thinking. Help shape the future of our products.',
      skills: skills.slice(0, 4),
      matchScore: 65,
      url: 'https://example.com/job5'
    }
  ];
}

export async function analyzeResumeWithGemini(resumeText: string, jobDescription?: string): Promise<Partial<AnalysisResult>> {
  const prompt = jobDescription 
    ? `
You are an expert ATS (Applicant Tracking System) and career analyzer. Analyze the following resume against the job description.

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

Provide a detailed analysis in JSON format:
{
  "candidate_profile": {
    "name": "Extracted Name or 'Candidate'",
    "education": "Education summary",
    "domains": ["domain1", "domain2"],
    "skills": ["skill1", "skill2", "skill3"],
    "projects": ["project1", "project2"],
    "experience": "Experience summary"
  },
  "job_analysis": {
    "role": "Job Title",
    "required_skills": ["req1", "req2", "req3"],
    "tech_stack": ["tech1", "tech2"],
    "experience_required": "Experience level",
    "domains": ["domain1"]
  },
  "skill_analysis": {
    "matched_skills": ["matched1", "matched2"],
    "missing_skills": ["missing1", "missing2"],
    "partial_skills": ["partial1"],
    "skill_match_percentage": 75
  },
  "evaluation": {
    "match_score": 78,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1"],
    "risk_factors": []
  },
  "overall_score": 78,
  "shortlist_probability": 82,
  "verdict": "STRONG_CANDIDATE"
}
`
    : `
You are an expert resume analyzer. Analyze the following resume and extract key information.

RESUME:
${resumeText.substring(0, 3000)}

Provide analysis in JSON format:
{
  "candidate_profile": {
    "name": "Extracted Name or 'Candidate'",
    "education": "Education summary",
    "domains": ["domain1", "domain2"],
    "skills": ["skill1", "skill2", "skill3"],
    "projects": ["project1", "project2"],
    "experience": "Experience summary"
  },
  "skill_analysis": {
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": [],
    "partial_skills": [],
    "skill_match_percentage": 80
  },
  "evaluation": {
    "match_score": 80,
    "strengths": ["strength1", "strength2"],
    "weaknesses": [],
    "risk_factors": []
  },
  "overall_score": 80,
  "shortlist_probability": 85,
  "verdict": "STRONG_CANDIDATE"
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
}
