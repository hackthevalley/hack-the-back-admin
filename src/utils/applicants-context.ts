import { createContext } from "react";

export type ApplicantProps = {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  app_id: string;
  created_at: string;
  updated_at: string;
  age?: string;
  gender?: string;
  school?: string;
  level_of_study?: string;
  role?: string;
  ranking_mu?: number | null;
  ranking_sigma_sq?: number | null;
  ranking_comparison_count?: number;
};

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
  applicants: ApplicantProps[];
  isLoadingApplicants: boolean;
  refreshApplicants: (params?: ApplicantsQueryParams) => Promise<void>;
  refreshAllApplicants: () => Promise<void>;
};

export const ApplicantsContext = createContext<ApplicantsContextValue | undefined>(
  undefined,
);
