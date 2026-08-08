import fetchInstance from "@/utils/api";
import type { ApplicantStatus } from "@/types/applicant";

export function getApplication<T>(applicationId: string, signal?: AbortSignal) {
  return fetchInstance(`admin/account/applications/${applicationId}`, { signal }) as Promise<T>;
}

export function getApplicationResume(applicationId: string, signal?: AbortSignal) {
  return fetchInstance(
    `admin/account/applications/${applicationId}/resume`,
    { method: "GET", signal },
    "blob",
  ) as Promise<Blob>;
}

export function getQuestions<T>(signal?: AbortSignal) {
  return fetchInstance("forms/questions", { signal }) as Promise<T>;
}

export function updateApplicationStatus(applicationId: string, status: ApplicantStatus) {
  return fetchInstance(
    `admin/account/applications/${applicationId}/status?request=${status}`,
    { method: "PATCH" },
  ) as Promise<{ application_id: string }>;
}

export function getJudgingPair<T>(signal?: AbortSignal) {
  return fetchInstance("admin/judging/pair", { signal }) as Promise<T>;
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
  return fetchInstance("meals") as Promise<T>;
}

export function updateMeal(mealId: string, isActive: boolean) {
  return fetchInstance(`meals/${mealId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export function sendBulkEmail<T>(payload: Record<string, unknown>) {
  return fetchInstance("admin/account/bulk-emails", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<T>;
}
