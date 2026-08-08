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
  level_of_study?: string;
  role?: string;
  ranking_mu?: number | null;
  ranking_sigma_sq?: number | null;
  ranking_comparison_count?: number;
}
