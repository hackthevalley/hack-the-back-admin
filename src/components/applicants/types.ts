import type { Dispatch, SetStateAction } from "react";

export enum ApplicantStatus {
  ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE",
  NOT_APPLIED = "NOT_APPLIED",
  APPLYING = "APPLYING",
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  WAITLISTED = "WAITLISTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  ACCEPTED_INVITE = "ACCEPTED_INVITE",
  REJECTED_INVITE = "REJECTED_INVITE",
  SCANNED_IN = "SCANNED_IN",
  WALK_IN = "WALK_IN",
  WALK_IN_SUBMITTED = "WALK_IN_SUBMITTED",
}

export interface Applicant {
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
  ranking_mu?: number | null;
  ranking_sigma_sq?: number | null;
  ranking_comparison_count?: number;
}

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
