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
  status: ApplicantStatus;
  app_id: string;
  created_at: string;
  updated_at: string;
  age: string | null;
  gender: string | null;
  school: string | null;
  level_of_study: string | null;
  ranking_mu?: number | null;
  ranking_sigma_sq?: number | null;
  ranking_comparison_count?: number;
}

export interface Question {
  question_id: string;
  label: string;
  section?: string | null;
}

export interface FormAnswer {
  question_id: string;
  answer: string | null;
}

export interface ApplicationStatusHistory {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  previous_status: ApplicantStatus;
  new_status: ApplicantStatus;
  changed_at: string;
}

export interface ApplicationDetail {
  status_history?: ApplicationStatusHistory[];
  application: { application_id: string } & Record<string, unknown>;
  form_answers: FormAnswer[];
  form_answer_files: string | null;
}

export const APPLICANT_STATUS_OPTIONS = Object.values(ApplicantStatus);
