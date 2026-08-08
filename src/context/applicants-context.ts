import { createContext } from "react";
import type { Applicant, ApplicantStatus } from "@/types/applicant";

export type ApplicantsQueryParams = {
  offset?: number;
  limit?: number;
  search?: string;
  level_of_study?: string;
  gender?: string;
  school?: string;
  dateSort?: string;
  applicationStatus?: ApplicantStatus | "";
  rankingSort?: string;
};

export type ApplicantsContextValue = {
  applicants: Applicant[];
  allApplicants: Applicant[];
  isLoadingApplicants: boolean;
  applicantsError: string | null;
  hasLoadedAllApplicants: boolean;
  refreshApplicants: (params?: ApplicantsQueryParams) => Promise<void>;
  refreshAllApplicants: (force?: boolean) => Promise<void>;
  updateApplicantStatus: (
    applicationId: string,
    status: ApplicantStatus,
  ) => void;
};

export const ApplicantsContext = createContext<
  ApplicantsContextValue | undefined
>(undefined);
