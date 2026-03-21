import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const resumeExtensions = ["pdf", "doc", "docx"];
const jdExtensions = ["pdf", "doc", "docx", "txt"];

// MIME types for additional validation
const resumeMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const getExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? "";

export const isResumeFile = (file: File) => {
  const extension = getExtension(file.name);
  const mimeType = file.type;
  
  // Check file extension
  if (!resumeExtensions.includes(extension)) {
    return false;
  }
  
  // Additional MIME type validation for security
  if (mimeType && !resumeMimeTypes.includes(mimeType)) {
    // Allow files without MIME type (some systems don't set it)
    if (mimeType !== "") {
      return false;
    }
  }
  
  // Check file size (max 10MB for resume)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
};

export const isJDFile = (file: File) => jdExtensions.includes(getExtension(file.name));

export const getFileValidationError = (file: File): string | null => {
  const extension = getExtension(file.name);
  const mimeType = file.type;
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  // Check if it's a resume file
  if (!resumeExtensions.includes(extension)) {
    return `केवल PDF, DOC, या DOCX फाइलें अपलोड करें। आपकी फाइल: .${extension}`;
  }
  
  // Check MIME type
  if (mimeType && !resumeMimeTypes.includes(mimeType)) {
    return "फाइल का प्रकार सही नहीं है। कृपया वैध resume फाइल अपलोड करें।";
  }
  
  // Check file size
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `फाइल का साइज़ बहुत बड़ा है (${sizeMB}MB)। कृपया 10MB से छोटी फाइल अपलोड करें।`;
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return "फाइल खाली है। कृपया वैध resume फाइल अपलोड करें।";
  }
  
  return null;
};

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = getExtension(file.name);

  if (extension === "pdf") {
    return extractTextFromPDF(file);
  }

  if (extension === "docx") {
    return extractTextFromDocx(file);
  }

  if (extension === "txt") {
    return (await file.text()).trim();
  }

  if (extension === "doc") {
    throw new Error("Old .doc files are not supported reliably. Please use PDF, DOCX, or paste text.");
  }

  const fallback = await file.text();
  return fallback.trim();
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      textParts.push(pageText);
    }
  }

  return textParts.join("\n").trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value.replace(/\s+/g, " ").trim();
}
