const LandingFooter = () => (
  <footer className="border-t border-border bg-card/50 py-10 px-6">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-r from-primary to-purple-600">
          S
        </div>
        <div>
          <p className="font-body text-sm font-bold text-foreground tracking-[0.2em] uppercase">SkillOS</p>
          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest">AI Career Intelligence</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-body text-center">
        © 2026 SkillOS — Virtual HR Intelligence Platform. Built for the AI Hackathon.
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          All systems operational
        </span>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
