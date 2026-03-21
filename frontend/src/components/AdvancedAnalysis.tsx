import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Award, Target, 
  BarChart3, Zap, Shield, Brain, CheckCircle2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult } from "@/types/analysis";

interface AdvancedAnalysisProps {
  data: AnalysisResult;
}

const AdvancedAnalysis = ({ data }: AdvancedAnalysisProps) => {
  const skillDepth = data.skill_analysis.skill_depth || {};
  const skillWeights = data.skill_analysis.skill_weights || [];
  const weightedScore = data.skill_analysis.weighted_match_score || 0;
  const riskFactors = data.skill_analysis.risk_factors || [];

  const getDepthColor = (depth: string) => {
    switch (depth) {
      case "advanced": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "beginner": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "High": return <Zap className="h-3 w-3" />;
      case "Medium": return <Target className="h-3 w-3" />;
      case "Low": return <CheckCircle2 className="h-3 w-3" />;
      default: return <CheckCircle2 className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Weighted Match Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weighted Match Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Role-based importance weighting applied
                </span>
                <span className="text-2xl font-bold text-primary">
                  {weightedScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={weightedScore} className="h-3" />
              <p className="text-xs text-muted-foreground">
                This score considers the importance of each skill for the specific role
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Depth Analysis */}
      {Object.keys(skillDepth).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Skill Depth Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(skillDepth).map(([skill, depth]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <span className="font-medium text-sm">{skill}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getDepthColor(depth)}`}
                    >
                      {depth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Role-based Skill Weights */}
      {skillWeights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Role-based Skill Importance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["High", "Medium", "Low"].map((importance) => {
                  const skillsOfImportance = skillWeights.filter(
                    (sw) => sw.importance === importance
                  );
                  
                  if (skillsOfImportance.length === 0) return null;
                  
                  return (
                    <div key={importance} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getImportanceIcon(importance)}
                        <span className="font-medium text-sm">
                          {importance} Priority ({skillsOfImportance.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-5">
                        {skillsOfImportance.map((skillWeight) => (
                          <Badge
                            key={skillWeight.skill}
                            variant="outline"
                            className={`text-xs ${getImportanceColor(importance)}`}
                          >
                            {skillWeight.skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Risk Factors Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskFactors.map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white border border-orange-200"
                  >
                    <Shield className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-800">{risk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison: Regular vs Weighted Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Score Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-muted-foreground">
                  {data.skill_analysis.skill_match_percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Basic Match
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">
                  {weightedScore.toFixed(1)}%
                </div>
                <div className="text-sm text-primary">
                  Weighted Match
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Weighted score considers role-specific skill importance
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalysis;