import fetchInstance from "@/lib/api";
import type { ApplicantStatus } from "@/types/applicant";

export interface RegistrationTimeRange {
  id: string;
  start_at: string;
  end_at: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicSchedule {
  event_start_at: string;
  event_end_at: string;
  events: ScheduleEvent[];
}

export type ScheduleEventInput = Pick<
  ScheduleEvent,
  "title" | "description" | "location" | "starts_at" | "ends_at"
>;

export function getSchedule(signal?: AbortSignal) {
  return fetchInstance<PublicSchedule>("schedule", { signal });
}

export function createScheduleEvent(payload: ScheduleEventInput) {
  return fetchInstance<ScheduleEvent>("admin/schedule", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateScheduleEvent(
  eventId: string,
  payload: ScheduleEventInput,
) {
  return fetchInstance<ScheduleEvent>(`admin/schedule/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteScheduleEvent(eventId: string) {
  return fetchInstance<null>(`admin/schedule/${eventId}`, {
    method: "DELETE",
  });
}

export function getRegistrationTimeRange(signal?: AbortSignal) {
  return fetchInstance<RegistrationTimeRange | null>(
    "forms/registration-timerange",
    {
      signal,
    },
  );
}

export function updateRegistrationTimeRange(payload: {
  start_at: string;
  end_at: string;
}) {
  return fetchInstance<RegistrationTimeRange>(
    "admin/forms/registration-timerange",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function getApplication<T>(applicationId: string, signal?: AbortSignal) {
  return fetchInstance<T>(`admin/account/applications/${applicationId}`, {
    signal,
  });
}

export function getApplicationResume(
  applicationId: string,
  signal?: AbortSignal,
) {
  return fetchInstance<Blob>(
    `admin/account/applications/${applicationId}/resume`,
    { method: "GET", signal },
    "blob",
  );
}

export function exportResumes(filters: {
  levelOfStudy?: string;
  applicationStatus?: ApplicantStatus | "";
}) {
  const query = new URLSearchParams();
  if (filters.levelOfStudy) {
    query.set("level_of_study", filters.levelOfStudy);
  }
  if (filters.applicationStatus) {
    query.set("role", filters.applicationStatus);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return fetchInstance<Blob>(
    `admin/account/resume-export${suffix}`,
    { method: "GET" },
    "blob",
  );
}

export function getQuestions<T>(signal?: AbortSignal) {
  return fetchInstance<T>("forms/questions", { signal });
}

export function updateApplicationStatus(
  applicationId: string,
  status: ApplicantStatus,
) {
  return fetchInstance<{ application_id: string }>(
    `admin/account/applications/${applicationId}/status?request=${status}`,
    { method: "PATCH" },
  );
}

export function getJudgingPair<T>(levelOfStudy: string, signal?: AbortSignal) {
  const query = new URLSearchParams();
  if (levelOfStudy) query.set("level_of_study", levelOfStudy);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return fetchInstance<T>(`admin/judging/pair${suffix}`, { signal });
}

export function submitJudgingDecision(payload: {
  request_id: string;
  left_application_id: string;
  right_application_id: string;
  winner_application_id: string;
}) {
  return fetchInstance("admin/judging/decisions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMeals<T>() {
  return fetchInstance<T>("meals");
}

export function updateMeal(mealId: string, isActive: boolean) {
  return fetchInstance(`meals/${mealId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export function sendBulkEmail<T>(payload: Record<string, unknown>) {
  return fetchInstance<T>("admin/account/bulk-emails", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
