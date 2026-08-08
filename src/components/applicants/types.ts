import type { Dispatch, SetStateAction } from "react";
export { ApplicantStatus } from "@/types/applicant";
export type { Applicant } from "@/types/applicant";

export interface ApplicantFiltersState {
  offset: number;
  search: string;
  levelOfStudy: string;
  gender: string;
  utsc: string;
  dateSort: string;
  role: string;
  rankingSort: string;
}

export type SetApplicantFilters = Dispatch<SetStateAction<ApplicantFiltersState>>;

export const DEFAULT_APPLICANT_FILTERS: ApplicantFiltersState = {
  offset: 0,
  search: "",
  levelOfStudy: "",
  gender: "",
  utsc: "",
  dateSort: "",
  role: "",
  rankingSort: "",
};
