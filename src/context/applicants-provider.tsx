import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import fetchInstance from "@/lib/api";

import { ApplicantsContext } from "./applicants-context";
import type { ApplicantsQueryParams } from "./applicants-context";
import { ApplicantStatus, type Applicant } from "@/types/applicant";

type ApplicantsApiResponse = {
  applications: RawApplicant[];
};

type RawApplicant = Partial<Applicant> & {
  status?: ApplicantStatus | null;
};

export function ApplicantsProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [applicantsError, setApplicantsError] = useState<string | null>(null);
  const [hasLoadedAllApplicants, setHasLoadedAllApplicants] = useState(false);

  const fetchApplicantPage = useCallback(
    async (params?: ApplicantsQueryParams): Promise<Applicant[]> => {
      const queryParams = new URLSearchParams({
        offset: String(params?.offset ?? 0),
        limit: String(params?.limit ?? 25),
      });
      if (params?.search) queryParams.set("search", params.search);
      if (params?.level_of_study) {
        queryParams.set("level_of_study", params.level_of_study);
      }
      if (params?.gender) queryParams.set("gender", params.gender);
      if (params?.school) queryParams.set("school", params.school);
      if (params?.dateSort) queryParams.set("date_sort", params.dateSort);
      if (params?.applicationStatus) {
        queryParams.set("role", params.applicationStatus);
      }
      if (params?.rankingSort) {
        queryParams.set("ranking_sort", params.rankingSort);
      }

      const data = (await fetchInstance(
        `admin/account/applications?${queryParams.toString()}`,
        { method: "GET" },
      )) as ApplicantsApiResponse;
      return data.applications.map(normalizeApplicant);
    },
    [],
  );

  const refreshApplicants = useCallback(
    async (params?: ApplicantsQueryParams) => {
      setIsLoadingApplicants(true);
      setApplicantsError(null);
      try {
        setApplicants(await fetchApplicantPage(params));
      } catch (error) {
        setApplicantsError(toErrorMessage(error));
        throw error;
      } finally {
        setIsLoadingApplicants(false);
      }
    },
    [fetchApplicantPage],
  );

  const refreshAllApplicants = useCallback(
    async (force = false) => {
      if (hasLoadedAllApplicants && !force) return;
      const pageSize = 100;
      setIsLoadingApplicants(true);
      setApplicantsError(null);
      try {
        const allApplicants: Applicant[] = [];
        const seenApplicationIds = new Set<string>();
        for (let offset = 0; ; offset += pageSize) {
          const page = await fetchApplicantPage({ offset, limit: pageSize });
          const newApplicants = page.filter(
            (applicant) => !seenApplicationIds.has(applicant.app_id),
          );
          newApplicants.forEach((applicant) => {
            seenApplicationIds.add(applicant.app_id);
          });
          allApplicants.push(...newApplicants);
          if (page.length < pageSize) break;
          if (newApplicants.length === 0) {
            throw new Error(
              "The applicant API did not advance to the next page",
            );
          }
        }
        setAllApplicants(
          Array.from(
            new Map(
              allApplicants.map((applicant) => [applicant.app_id, applicant]),
            ).values(),
          ),
        );
        setHasLoadedAllApplicants(true);
      } catch (error) {
        setApplicantsError(toErrorMessage(error));
        throw error;
      } finally {
        setIsLoadingApplicants(false);
      }
    },
    [fetchApplicantPage, hasLoadedAllApplicants],
  );

  const updateApplicantStatus = useCallback(
    (applicationId: string, status: ApplicantStatus) => {
      setApplicants((current) =>
        current.map((applicant) =>
          applicant.app_id === applicationId
            ? { ...applicant, status, updated_at: new Date().toISOString() }
            : applicant,
        ),
      );
      setAllApplicants((current) =>
        current.map((applicant) =>
          applicant.app_id === applicationId
            ? { ...applicant, status, updated_at: new Date().toISOString() }
            : applicant,
        ),
      );
    },
    [],
  );

  return (
    <ApplicantsContext.Provider
      value={{
        applicants,
        allApplicants,
        isLoadingApplicants,
        applicantsError,
        hasLoadedAllApplicants,
        refreshApplicants,
        refreshAllApplicants,
        updateApplicantStatus,
      }}
    >
      {children}
    </ApplicantsContext.Provider>
  );
}

function normalizeApplicant(applicant: RawApplicant): Applicant {
  return {
    ...applicant,
    first_name: applicant.first_name ?? "",
    last_name: applicant.last_name ?? "",
    email: applicant.email ?? "",
    status:
      applicant.status &&
      Object.values(ApplicantStatus).includes(applicant.status)
        ? applicant.status
        : ApplicantStatus.NOT_APPLIED,
    app_id: applicant.app_id ?? "",
    created_at: applicant.created_at ?? "",
    updated_at: applicant.updated_at ?? "",
    age: applicant.age ?? null,
    gender: applicant.gender ?? null,
    school: applicant.school ?? null,
    level_of_study: applicant.level_of_study ?? null,
    ranking_comparison_count: applicant.ranking_comparison_count ?? 0,
  };
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load applicants";
}
