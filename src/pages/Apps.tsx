import { Applicants } from "@/components/Applicants";
import { useApplicants } from "@/context/useApplicants";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_APPLICANT_FILTERS,
  type ApplicantFiltersState,
} from "@/components/applicants/types";

function Apps() {
  const [filters, setFilters] = useState<ApplicantFiltersState>(
    DEFAULT_APPLICANT_FILTERS,
  );
  const { applicants, applicantsError, refreshApplicants } = useApplicants();

  const loadApplicants = useCallback(
    () =>
      refreshApplicants({
        offset: filters.offset,
        limit: 25,
        search: filters.search,
        level_of_study: filters.levelOfStudy,
        gender: filters.gender,
        school: filters.school,
        dateSort: filters.dateSort,
        applicationStatus: filters.applicationStatus,
        rankingSort: filters.rankingSort,
      }),
    [filters, refreshApplicants],
  );

  useEffect(() => {
    void loadApplicants().catch(() => undefined);
  }, [loadApplicants]);

  return (
    <main className="min-w-0 flex-1 overflow-auto">
      {applicantsError ? (
        <div className="mx-4 mt-4 flex items-center justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <span>{applicantsError}</span>
          <button
            type="button"
            className="font-medium underline"
            onClick={() => void loadApplicants()}
          >
            Retry
          </button>
        </div>
      ) : null}
      <Applicants
        applicants={applicants}
        filters={filters}
        setFilters={setFilters}
      />
    </main>
  );
}

export default Apps;
