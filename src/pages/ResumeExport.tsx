import { useState } from "react";
import { Download, FileArchive } from "lucide-react";
import { toast } from "sonner";

import { exportResumes } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICANT_STATUS_OPTIONS,
  type ApplicantStatus,
} from "@/types/applicant";

const ALL = "all";

const STUDY_LEVEL_OPTIONS = [
  { label: "High School", value: "High School" },
  { label: "1st Year", value: "Freshman - Undergraduate" },
  { label: "2nd Year", value: "Sophomore - Undergraduate" },
  { label: "3rd Year", value: "Junior - Undergraduate" },
  { label: "4th Year", value: "Senior - Undergraduate" },
  { label: "Graduate", value: "Graduate" },
  { label: "PhD", value: "PhD" },
  { label: "Other", value: "Other" },
] as const;

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ResumeExport() {
  const [levelOfStudy, setLevelOfStudy] = useState(ALL);
  const [applicationStatus, setApplicationStatus] = useState<
    ApplicantStatus | typeof ALL
  >(ALL);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportResumes({
        levelOfStudy: levelOfStudy === ALL ? "" : levelOfStudy,
        applicationStatus: applicationStatus === ALL ? "" : applicationStatus,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Resume export downloaded");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Unable to export resumes",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Resume Export</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Download matching applicant resumes in one sorted ZIP archive.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5" />
              Export filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resume-year">Year of study</Label>
                <Select
                  value={levelOfStudy}
                  onValueChange={(value) => {
                    setLevelOfStudy(value);
                  }}
                >
                  <SelectTrigger id="resume-year">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All years</SelectItem>
                    {STUDY_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-status">Application status</Label>
                <Select
                  value={applicationStatus}
                  onValueChange={(value) => {
                    setApplicationStatus(value as ApplicantStatus | typeof ALL);
                  }}
                >
                  <SelectTrigger id="resume-status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    {APPLICANT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border bg-background/50 p-4 text-sm text-muted-foreground">
              Resumes are ordered by last name, then first name. The ZIP also
              includes a manifest.csv with applicant details, status, and year.
            </div>

            <Button
              onClick={() => void handleExport()}
              disabled={exporting}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Preparing export…" : "Download resume ZIP"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
