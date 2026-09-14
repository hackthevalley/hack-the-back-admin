import { useEffect, useMemo, useState } from "react";
import StatusChart from "@/components/StatusChart";
import RegistrationTimeRange from "@/components/RegistrationTimeRange";
import { useApplicants } from "@/context/useApplicants";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPLICANT_STATUS_OPTIONS, ApplicantStatus } from "@/types/applicant";

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Home() {
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | "all">(
    ApplicantStatus.APPLIED,
  );
  const {
    allApplicants: applicants,
    applicantsError,
    isLoadingApplicants,
    refreshAllApplicants,
  } = useApplicants();

  const filteredApplicants = useMemo(
    () =>
      statusFilter === "all"
        ? applicants
        : applicants.filter((applicant) => applicant.status === statusFilter),
    [applicants, statusFilter],
  );

  useEffect(() => {
    void refreshAllApplicants().catch(() => undefined);
  }, [refreshAllApplicants]);

  return (
    <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Applicant overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Distribution across all {applicants.length.toLocaleString()}{" "}
          applications
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:max-w-xs">
          <Label htmlFor="stats-status">Status for demographic stats</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              const status = APPLICANT_STATUS_OPTIONS.find(
                (status) => status.valueOf() === value,
              );
              if (value === "all" || status) setStatusFilter(status ?? "all");
            }}
          >
            <SelectTrigger
              id="stats-status"
              aria-describedby="stats-status-summary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPLICANT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p
          id="stats-status-summary"
          className="mt-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          School, level of study, and gender:{" "}
          {filteredApplicants.length.toLocaleString()} applicants
          {statusFilter === "all"
            ? " across all statuses"
            : ` with status ${formatStatus(statusFilter)}`}
          .
        </p>
      </header>
      <RegistrationTimeRange />
      {applicantsError ? (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{applicantsError}</p>
          <button
            type="button"
            className="text-sm font-medium underline"
            onClick={() => void refreshAllApplicants(true)}
          >
            Retry
          </button>
        </div>
      ) : null}
      {isLoadingApplicants && applicants.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Loading applicants…
        </p>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-2">
          <StatusChart
            title="Applicants by Status"
            field="status"
            applicants={applicants}
            isLoading={isLoadingApplicants}
          />
          <StatusChart
            title="Applicants by School"
            field="school"
            maxCategories={8}
            applicants={filteredApplicants}
            isLoading={isLoadingApplicants}
          />
          <StatusChart
            title="Applicants by Level of Study"
            field="level_of_study"
            maxCategories={8}
            applicants={filteredApplicants}
            isLoading={isLoadingApplicants}
          />
          <StatusChart
            title="Applicants by Gender"
            field="gender"
            applicants={filteredApplicants}
            isLoading={isLoadingApplicants}
          />
        </div>
      )}
    </main>
  );
}

export default Home;
