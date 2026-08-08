import type { Dispatch, SetStateAction } from "react";
import type { ApplicantStatus } from "@/types/applicant";
export { ApplicantStatus } from "@/types/applicant";
export type { Applicant } from "@/types/applicant";

export interface ApplicantFiltersState {
  offset: number;
  search: string;
  levelOfStudy: string;
  gender: string;
  school: string;
  dateSort: string;
  applicationStatus: ApplicantStatus | "";
  rankingSort: string;
}

export type SetApplicantFilters = Dispatch<
  SetStateAction<ApplicantFiltersState>
>;

export const DEFAULT_APPLICANT_FILTERS: ApplicantFiltersState = {
  offset: 0,
  search: "",
  levelOfStudy: "",
  gender: "",
  school: "",
  dateSort: "",
  applicationStatus: "",
  rankingSort: "",
};
