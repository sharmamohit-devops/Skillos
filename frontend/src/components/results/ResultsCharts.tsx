import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalysisResult } from "@/types/analysis";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "18px",
  color: "hsl(var(--foreground))",
  boxShadow: "var(--shadow-card)",
};

const ResultsCharts = ({ data }: { data: AnalysisResult }) => {
  const skillMix = [
    { name: "Matched", value: data.skill_analysis.matched_skills.length, fill: "hsl(var(--success))" },
    { name: "Partial", value: data.skill_analysis.partial_skills.length, fill: "hsl(var(--warning))" },
    { name: "Missing", value: data.skill_analysis.missing_skills.length, fill: "hsl(var(--destructive))" },
  ];

  const radarData = [
    { subject: "Skill Fit", value: data.skill_analysis.skill_match_percentage },
    { subject: "Overall Match", value: data.evaluation.match_score },
    {
      subject: "Strength Depth",
      value: Math.min(100, data.evaluation.strengths.length * 18 + 20),
    },
    {
      subject: "Risk Control",
      value: Math.max(20, 100 - data.evaluation.risk_factors.length * 18),
    },
    {
      subject: "Roadmap Ready",
      value: Math.min(100, data.roadmap_context.suggested_project_types.length * 16 + 20),
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-[1.5rem] border border-border bg-background p-4 md:p-5">
        <div className="mb-4">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Skills Snapshot</p>
          <h4 className="font-display text-lg text-foreground">Coverage breakdown</h4>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillMix} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.5)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[14, 14, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border bg-background p-4 md:p-5">
        <div className="mb-4">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Decision Radar</p>
          <h4 className="font-display text-lg text-foreground">Fit quality map</h4>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar
                dataKey="value"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent) / 0.24)"
                fillOpacity={1}
                strokeWidth={2.5}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultsCharts;
