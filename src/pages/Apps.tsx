import { Applicants } from "@/components/Applicants";
import { useApplicants } from "@/utils/useApplicants";
import { useEffect, useState } from "react";
import {
  DEFAULT_APPLICANT_FILTERS,
  type ApplicantFiltersState,
} from "@/components/applicants/types";

function Apps() {
  const [filters, setFilters] = useState<ApplicantFiltersState>(
    DEFAULT_APPLICANT_FILTERS,
  );
  const { applicants, refreshApplicants } = useApplicants();

  // Refetch applicants when any filter changes
  useEffect(() => {
    refreshApplicants({
        offset: filters.offset,
        limit: 25,
        search: filters.search,
        level_of_study: filters.levelOfStudy,
        gender: filters.gender,
        school: filters.utsc,
        dateSort: filters.dateSort,
        role: filters.role,
        rankingSort: filters.rankingSort,
    });
  }, [
    filters,
    refreshApplicants,
  ]);

  return (
      <main className="min-w-0 flex-1 overflow-auto">
        <Applicants
          applicants={applicants}
          filters={filters}
          setFilters={setFilters}
        />
      </main>
  );
}

export default Apps;
