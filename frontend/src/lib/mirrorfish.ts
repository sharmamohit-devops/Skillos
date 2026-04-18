import type { AnalysisResult } from '@/types/analysis';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Analyze resume using the MirrorFish backend API
 * This function is used by the feature pages for standalone analysis
 */
export async function analyzeWithMirrorFish(
  resumeText: string,
  jobDescription: string,
  weeklyHours: number = 20
): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      resume_text: resumeText, 
      jd_text: jobDescription,
      weekly_hours: weeklyHours 
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  return result as AnalysisResult;
}

/**
 * Analyze resume only (without JD) - for features like Virtual HR Comments
 */
export async function analyzeResumeOnly(
  resumeText: string
): Promise<AnalysisResult> {
  return analyzeWithMirrorFish(resumeText, '', 20);
}

/**
 * Get detailed analysis with skill depth detection
 */
export async function getDetailedAnalysis(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/analyze/detailed`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      resume_text: resumeText, 
      jd_text: jobDescription,
      detailed: true
    }),
  });

  if (!response.ok) {
    throw new Error(`Detailed analysis failed: ${response.status} ${response.statusText}`);
  }

  return await response.json() as AnalysisResult;
}

/**
 * Check if the MirrorFish API is available
 */
export async function checkMirrorFishStatus(): Promise<{
  available: boolean;
  status: string;
  version?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        status: data.status || 'healthy',
        version: data.version
      };
    }

    return {
      available: false,
      status: 'unavailable'
    };
  } catch (error) {
    return {
      available: false,
      status: 'error'
    };
  }
}
