import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { isResumeFile } from "@/lib/extractText";

interface FileUploadCardProps {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadCard = ({ label, description, file, onFileChange }: FileUploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleValidFile = useCallback(
    (selected: File | null | undefined) => {
      if (!selected) return;

      if (!isResumeFile(selected)) {
        toast({
          title: "Invalid resume file",
          description: "Resume ke liye sirf PDF, DOC, ya DOCX file upload karo.",
          variant: "destructive",
        });
        return;
      }

      onFileChange(selected);
    },
    [onFileChange, toast]
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-[1.75rem] border transition-all duration-300 glow-card",
        isDragging ? "border-accent bg-accent/5 scale-[1.01]" : file ? "border-success/30 bg-success/5" : "border-border bg-card hover:border-accent/30"
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="flex flex-col items-center text-center gap-4 p-8 relative z-10">
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="done"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center"
            >
              <CheckCircle className="w-7 h-7 text-success" />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center"
            >
              <Upload className="w-7 h-7 text-accent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <h3 className="font-body font-semibold text-foreground text-base">{label}</h3>
          <p className="text-muted-foreground text-sm font-body max-w-xs">{description}</p>
        </div>

        {file ? (
          <div className="w-full rounded-2xl border border-success/20 bg-success/10 px-4 py-3 flex items-center justify-between gap-3 animate-enter">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-success shrink-0" />
              <span className="text-sm font-medium text-foreground truncate font-body">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
              aria-label="Remove file"
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
              Choose Resume File
            </button>
            <p className="text-xs text-muted-foreground font-body">
              Drag & drop supported · PDF / DOC / DOCX
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FileUploadCard;
