import { createContext } from "react";
import type { Applicant } from "@/types/applicant";

export type ApplicantsQueryParams = {
  offset?: number;
  limit?: number;
  search?: string;
  level_of_study?: string;
  gender?: string;
  school?: string;
  dateSort?: string;
  role?: string;
  rankingSort?: string;
};

export type ApplicantsContextValue = {
  applicants: Applicant[];
  isLoadingApplicants: boolean;
  refreshApplicants: (params?: ApplicantsQueryParams) => Promise<void>;
  refreshAllApplicants: () => Promise<void>;
};

export const ApplicantsContext = createContext<ApplicantsContextValue | undefined>(
  undefined,
);
