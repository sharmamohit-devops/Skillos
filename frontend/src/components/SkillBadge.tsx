import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  variant: "matched" | "missing" | "partial";
}

const SkillBadge = ({ skill, variant }: SkillBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-body",
        variant === "matched" && "bg-success/15 text-success",
        variant === "missing" && "bg-destructive/15 text-destructive",
        variant === "partial" && "bg-warning/15 text-warning"
      )}
    >
      {variant === "matched" && "✓ "}
      {variant === "missing" && "✗ "}
      {variant === "partial" && "~ "}
      {skill}
    </span>
  );
};

export default SkillBadge;
