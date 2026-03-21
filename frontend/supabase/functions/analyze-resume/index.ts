import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANALYSIS_SCHEMA = {
  name: "analyze_resume",
  description: "Analyze a resume against a job description and return structured match data",
  parameters: {
    type: "object",
    properties: {
      candidate_profile: {
        type: "object",
        properties: {
          name: { type: "string" },
          education: { type: "string" },
          domains: { type: "array", items: { type: "string" } },
          skills: { type: "array", items: { type: "string" } },
          projects: { type: "array", items: { type: "string" } },
          experience: { type: "string" },
        },
        required: ["name", "education", "domains", "skills", "projects", "experience"],
      },
      job_analysis: {
        type: "object",
        properties: {
          role: { type: "string" },
          required_skills: { type: "array", items: { type: "string" } },
          tech_stack: { type: "array", items: { type: "string" } },
          experience_required: { type: "string" },
          domains: { type: "array", items: { type: "string" } },
        },
        required: ["role", "required_skills", "tech_stack", "experience_required", "domains"],
      },
      skill_analysis: {
        type: "object",
        properties: {
          matched_skills: { type: "array", items: { type: "string" } },
          missing_skills: { type: "array", items: { type: "string" } },
          partial_skills: { type: "array", items: { type: "string" } },
          skill_match_percentage: { type: "number" },
        },
        required: ["matched_skills", "missing_skills", "partial_skills", "skill_match_percentage"],
      },
      gap_intelligence: {
        type: "array",
        items: {
          type: "object",
          properties: {
            skill: { type: "string" },
            importance_level: { type: "string", enum: ["High", "Medium", "Low"] },
            skill_type: { type: "string", enum: ["core", "tool", "framework", "concept"] },
            dependency_skills: { type: "array", items: { type: "string" } },
            related_resume_gap: { type: "string" },
            expected_depth: { type: "string", enum: ["basic", "intermediate", "advanced"] },
          },
          required: ["skill", "importance_level", "skill_type", "dependency_skills", "related_resume_gap", "expected_depth"],
        },
      },
      evaluation: {
        type: "object",
        properties: {
          match_score: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } },
        },
        required: ["match_score", "strengths", "weaknesses", "risk_factors"],
      },
      roadmap_context: {
        type: "object",
        properties: {
          preferred_learning_domains: { type: "array", items: { type: "string" } },
          project_complexity_level: { type: "string" },
          suggested_project_types: { type: "array", items: { type: "string" } },
          toolchain_recommendations: { type: "array", items: { type: "string" } },
        },
        required: ["preferred_learning_domains", "project_complexity_level", "suggested_project_types", "toolchain_recommendations"],
      },
    },
    required: ["candidate_profile", "job_analysis", "skill_analysis", "gap_intelligence", "evaluation", "roadmap_context"],
    additionalProperties: false,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jdText } = await req.json();

    if (!resumeText || !jdText) {
      return new Response(
        JSON.stringify({ error: "Both resumeText and jdText are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert resume analyzer and career counselor. Analyze the candidate's resume against the job description thoroughly.

Instructions:
- Extract ALL skills, technologies, tools from both the resume and JD
- Carefully match skills (consider synonyms: e.g., "JS" = "JavaScript")
- Calculate accurate match_score (0-100) based on overall fit including experience, skills, domain
- Calculate skill_match_percentage based purely on skill overlap
- Identify partial skills (candidate has related but not exact skill)
- CRITICAL: For gap_intelligence, you MUST include an entry for EVERY missing skill AND every partial skill. If there are 10 missing skills, there must be at least 10 entries in gap_intelligence. Do NOT skip any.
- Be specific and actionable in strengths, weaknesses, and risk_factors
- Suggest realistic learning paths in roadmap_context
- Include at least 3-5 toolchain_recommendations and 3-5 suggested_project_types`;

    const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Analyze this resume against the job description and provide a comprehensive structured analysis.`;

    // Try multiple models with retry for resilience
    const models = [
      "google/gemini-2.5-flash",
      "google/gemini-3-flash-preview",
      "google/gemini-2.5-pro",
    ];

    let lastError = "";
    let data: unknown = null;

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`Trying model: ${model}, attempt: ${attempt + 1}`);
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              tools: [
                {
                  type: "function",
                  function: ANALYSIS_SCHEMA,
                },
              ],
              tool_choice: { type: "function", function: { name: "analyze_resume" } },
            }),
          });

          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (response.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          if (!response.ok) {
            const errorText = await response.text();
            lastError = `${model}: ${response.status} ${errorText}`;
            console.error("AI Gateway error:", lastError);
            // Wait before retry
            if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
            continue;
          }

          data = await response.json();
          break;
        } catch (e) {
          lastError = `${model}: ${e instanceof Error ? e.message : String(e)}`;
          console.error("Fetch error:", lastError);
          if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
        }
      }
      if (data) break;
    }

    if (!data) {
      throw new Error(`All AI models failed. Last error: ${lastError}`);
    }

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-resume error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
