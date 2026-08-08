import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApplicationDetail, Question } from "@/types/applicant";

const HIDDEN_QUESTION_LABELS = new Set([
  "first name",
  "last name",
  "email",
  "phone number",
  "github",
  "linkedin",
  "devpost",
  "attach your resume",
]);

export function ApplicationCard({
  side,
  detail,
  resumeUrl,
  questions,
  disabled,
  expanded,
  onChoose,
}: {
  side: "A" | "B";
  detail: ApplicationDetail;
  resumeUrl: string | null | undefined;
  questions: Question[];
  disabled: boolean;
  expanded: boolean;
  onChoose: () => void;
}) {
  const answers = new Map(
    detail.form_answers.map((answer) => [answer.question_id, answer.answer]),
  );
  const visibleQuestions = questions.filter(
    (question) =>
      !HIDDEN_QUESTION_LABELS.has(question.label.trim().toLowerCase()),
  );

  return (
    <Card
      className={`flex min-h-0 flex-col ${expanded ? "h-full overflow-hidden" : ""}`}
    >
      <CardHeader>
        <CardTitle>Application {side}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <dl
          className={`${expanded ? "" : "max-h-[calc(100vh-22rem)]"} min-h-0 flex-1 space-y-3 overflow-y-auto pr-2`}
        >
          <div className="border-b pb-2">
            <dt className="mb-2 text-sm font-semibold">Resume</dt>
            <dd>
              {resumeUrl === undefined ? (
                <p className="text-sm text-muted-foreground">Loading resume…</p>
              ) : resumeUrl ? (
                <iframe
                  src={resumeUrl}
                  title={`Application ${side} resume`}
                  className={`${expanded ? "h-[calc(100vh-18rem)] min-h-[32rem]" : "h-[32rem]"} w-full rounded-md border`}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resume unavailable
                </p>
              )}
            </dd>
          </div>
          {visibleQuestions.map((question) => {
            const answer = answers.get(question.question_id)?.trim();
            return (
              <div key={question.question_id} className="border-b pb-2">
                <dt className="text-sm font-semibold">{question.label}</dt>
                <dd className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {answer || "N/A"}
                </dd>
              </div>
            );
          })}
        </dl>
        <Button
          size="lg"
          disabled={disabled}
          onClick={onChoose}
          className="cursor-pointer transition-[box-shadow,background-color,opacity] duration-150 hover:shadow-md active:opacity-80 disabled:pointer-events-auto disabled:cursor-wait disabled:hover:shadow-none"
        >
          {disabled ? "Recording choice…" : `Choose application ${side}`}
        </Button>
      </CardContent>
    </Card>
  );
}
