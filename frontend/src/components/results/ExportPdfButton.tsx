import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ExportPdfButton = ({ targetId }: { targetId: string }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      toast({ title: "Export failed", description: "Report section not found.", variant: "destructive" });
      return;
    }

    try {
      setIsExporting(true);
      const rootStyles = getComputedStyle(document.documentElement);
      const backgroundColor = `hsl(${rootStyles.getPropertyValue("--background").trim()})`;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor,
        logging: false,
        windowWidth: element.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save("resume-analysis-report.pdf");
      toast({ title: "PDF ready", description: "Analysis report download ho gaya." });
    } catch (error) {
      console.error(error);
      toast({ title: "Export failed", description: "PDF generate nahi ho paaya.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="rounded-2xl px-5 py-6 font-body text-sm font-semibold text-primary-foreground hover-lift"
      style={{ background: "var(--gradient-cta)", boxShadow: "var(--shadow-glow)" }}
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Generating PDF..." : "Download PDF Report"}
    </Button>
  );
};

export default ExportPdfButton;
