import type { Dispatch, SetStateAction } from "react";
export { ApplicantStatus } from "@/types/applicant";
export type { Applicant } from "@/types/applicant";

export interface ApplicantFilterProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  levelOfStudy: string;
  setLevelOfStudy: Dispatch<SetStateAction<string>>;
  gender: string;
  setGender: Dispatch<SetStateAction<string>>;
  utsc: string;
  setUTSC: Dispatch<SetStateAction<string>>;
  dateSort: string;
  setDateSort: Dispatch<SetStateAction<string>>;
  role: string;
  setRole: Dispatch<SetStateAction<string>>;
  rankingSort: string;
  setRankingSort: Dispatch<SetStateAction<string>>;
  setOffset: Dispatch<SetStateAction<number>>;
}
