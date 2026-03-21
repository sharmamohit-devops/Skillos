import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const resumeExtensions = ["pdf", "doc", "docx"];
const jdExtensions = ["pdf", "doc", "docx", "txt"];

const getExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? "";

export const isResumeFile = (file: File) => resumeExtensions.includes(getExtension(file.name));
export const isJDFile = (file: File) => jdExtensions.includes(getExtension(file.name));

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
