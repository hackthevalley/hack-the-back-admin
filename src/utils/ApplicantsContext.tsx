import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import fetchInstance from "@/utils/api";

import { ApplicantsContext } from "./applicants-context";
import type {
  ApplicantProps,
  ApplicantsQueryParams,
} from "./applicants-context";

type ApplicantsApiResponse = {
  application: ApplicantProps[];
};

export function ApplicantsProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<ApplicantProps[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  const fetchApplicantPage = useCallback(
    async (params?: ApplicantsQueryParams): Promise<ApplicantProps[]> => {
      const queryParams = new URLSearchParams({
        ofs: String(params?.offset ?? 0),
        limit: String(params?.limit ?? 25),
      });
      if (params?.search) queryParams.set("search", params.search);
      if (params?.level_of_study) {
        queryParams.set("level_of_study", params.level_of_study);
      }
      if (params?.gender) queryParams.set("gender", params.gender);
      if (params?.school) queryParams.set("school", params.school);
      if (params?.dateSort) queryParams.set("date_sort", params.dateSort);
      if (params?.role) queryParams.set("role", params.role);
      if (params?.rankingSort) {
        queryParams.set("ranking_sort", params.rankingSort);
      }

      const data: ApplicantsApiResponse = await fetchInstance(
        `admin/account/applications?${queryParams.toString()}`,
        { method: "GET" },
      );
      return data.application.map(normalizeApplicant);
    },
    [],
  );

  const refreshApplicants = useCallback(
    async (params?: ApplicantsQueryParams) => {
      setIsLoadingApplicants(true);
      try {
        setApplicants(await fetchApplicantPage(params));
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setIsLoadingApplicants(false);
      }
    },
    [fetchApplicantPage],
  );

  const refreshAllApplicants = useCallback(async () => {
    const pageSize = 100;
    setIsLoadingApplicants(true);
    try {
      const allApplicants: ApplicantProps[] = [];
      for (let offset = 0; ; offset += pageSize) {
        const page = await fetchApplicantPage({ offset, limit: pageSize });
        allApplicants.push(...page);
        if (page.length < pageSize) break;
      }
      setApplicants(
        Array.from(
          new Map(allApplicants.map((applicant) => [applicant.app_id, applicant])).values(),
        ),
      );
    } catch (error) {
      console.error("Error fetching all applicants:", error);
    } finally {
      setIsLoadingApplicants(false);
    }
  }, [fetchApplicantPage]);

  return (
    <ApplicantsContext.Provider
      value={{
        applicants,
        isLoadingApplicants,
        refreshApplicants,
        refreshAllApplicants,
      }}
    >
      {children}
    </ApplicantsContext.Provider>
  );
}

function normalizeApplicant(applicant: ApplicantProps): ApplicantProps {
  return {
    ...applicant,
    email: applicant.email ?? "",
    status: applicant.status ?? "unknown",
    app_id: applicant.app_id ?? "unknown",
    created_at: applicant.created_at ?? "unknown",
    updated_at: applicant.updated_at ?? "unknown",
    age: applicant.age ?? "unknown",
    gender: applicant.gender ?? "unknown",
    school: applicant.school ?? "unknown",
    level_of_study: applicant.level_of_study ?? "unknown",
    ranking_comparison_count: applicant.ranking_comparison_count ?? 0,
  };
}
