import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle, FileUp, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { isJDFile } from "@/lib/extractText";

interface JDInputCardProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  text: string;
  onTextChange: (text: string) => void;
}

const JDInputCard = ({ file, onFileChange, text, onTextChange }: JDInputCardProps) => {
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleValidFile = useCallback(
    (selected: File | null | undefined) => {
      if (!selected) return;

      if (!isJDFile(selected)) {
        toast({
          title: "Invalid JD file",
          description: "JD ke liye PDF, DOC, DOCX, TXT ya direct text use karo.",
          variant: "destructive",
        });
        return;
      }

      onTextChange("");
      onFileChange(selected);
      setMode("upload");
    },
    [onFileChange, onTextChange, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleValidFile(e.dataTransfer.files[0]);
    },
    [handleValidFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleValidFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleTextChange = (value: string) => {
    onTextChange(value);
    if (value.trim().length > 0) {
      onFileChange(null);
      setMode("text");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.75rem] border border-border bg-card overflow-hidden glow-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="grid grid-cols-2 border-b border-border bg-muted/40 p-1.5 m-2 rounded-2xl">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-body font-medium transition-all",
            mode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileUp className="w-4 h-4" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-body font-medium transition-all",
            mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Type className="w-4 h-4" /> Paste Text
        </button>
      </div>

      {mode === "upload" ? (
        <div
          className={cn(
            "p-8 transition-all duration-300",
            isDragging ? "bg-accent/5" : file ? "bg-info/5" : "hover:bg-accent/[0.03]"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleInputChange}
          />

          <div className="flex flex-col items-center text-center gap-4">
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-7 h-7 text-info" />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center"
                >
                  <Upload className="w-7 h-7 text-accent" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <h3 className="font-body font-semibold text-foreground text-base">Job Description</h3>
              <p className="text-muted-foreground text-sm font-body max-w-xs">
                PDF, DOC, DOCX, TXT upload karo ya text paste karo.
              </p>
            </div>

            {file ? (
              <div className="w-full rounded-2xl border border-info/20 bg-info/10 px-4 py-3 flex items-center justify-between gap-3 animate-enter">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-info shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate font-body">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
                  aria-label="Remove JD file"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-2xl px-5 py-3 font-body text-sm font-semibold text-primary-foreground shimmer-btn hover-lift"
                  style={{ background: "var(--gradient-cta)", boxShadow: "var(--shadow-glow)" }}
                >
                  Choose JD File
                </button>
                <p className="text-xs text-muted-foreground font-body">
                  Drag & drop supported · PDF / DOC / DOCX / TXT
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 animate-enter">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste the job description here... role, skills, responsibilities, tools, experience — sab daal do."
            className="w-full h-52 resize-none rounded-[1.5rem] border border-border bg-background p-5 text-sm font-body text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          />
          <div className="mt-3 flex items-center justify-between text-xs font-body text-muted-foreground">
            <span>{text.trim().length > 20 ? "Text JD ready for analysis" : "At least 20 characters paste karo"}</span>
            <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default JDInputCard;
