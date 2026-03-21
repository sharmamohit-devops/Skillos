const LandingFooter = () => {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-display italic text-accent text-lg font-semibold">SkillSync</span>
        <p className="text-xs text-muted-foreground font-body">
          © 2026 SkillSync — AI-Powered Resume Analysis
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
