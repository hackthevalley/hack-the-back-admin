import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import fetchInstance from "@/utils/api";
import { UserContext } from "@/utils/auth";

type Score = {
  application_id: string;
  mu: number;
  sigma_sq: number;
  comparison_count: number;
};

type Pair = { left: Score; right: Score };
type Question = { question_id: string; label: string };
type Answer = { question_id: string; answer: string | null };
type ApplicationDetail = {
  application: { application_id: string };
  form_answers: Answer[];
  form_answersfile: string | null;
};
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

function ApplicationCard({
  side,
  detail,
  resumeUrl,
  questions,
  disabled,
  onChoose,
}: {
  side: "A" | "B";
  detail: ApplicationDetail;
  resumeUrl: string | null | undefined;
  questions: Question[];
  disabled: boolean;
  onChoose: () => void;
}) {
  const answers = new Map(
    detail.form_answers.map((answer) => [answer.question_id, answer.answer]),
  );
  const visibleQuestions = questions.filter(
    (question) => !HIDDEN_QUESTION_LABELS.has(question.label.trim().toLowerCase()),
  );

  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader>
        <CardTitle>Application {side}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <dl className="max-h-[calc(100vh-22rem)] flex-1 space-y-3 overflow-y-auto pr-2">
          <div className="border-b pb-2">
            <dt className="mb-2 text-sm font-semibold">Resume</dt>
            <dd>
              {resumeUrl === undefined ? (
                <p className="text-sm text-muted-foreground">Loading resume…</p>
              ) : resumeUrl ? (
                <iframe
                  src={resumeUrl}
                  title={`Application ${side} resume`}
                  className="h-[32rem] w-full rounded-md border"
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

export default function Rank() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  const [pair, setPair] = useState<Pair | null>(null);
  const [details, setDetails] = useState<ApplicationDetail[]>([]);
  const [resumeUrls, setResumeUrls] = useState<
    [string | null | undefined, string | null | undefined]
  >([undefined, undefined]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const questionsRef = useRef<Question[]>([]);
  const resumeUrlsRef = useRef<(string | null)[]>([]);
  const loadControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      loadControllerRef.current?.abort();
      resumeUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const loadPair = useCallback(async () => {
    loadControllerRef.current?.abort();
    resumeUrlsRef.current.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    resumeUrlsRef.current = [];

    const controller = new AbortController();
    loadControllerRef.current = controller;
    setLoading(true);
    setError(null);
    setResumeUrls([undefined, undefined]);
    try {
      const nextPair: Pair = await fetchInstance("admin/judging/pair", {
        signal: controller.signal,
      });
      const loadResume = async (applicationId: string, index: 0 | 1) => {
        try {
          const blob = await fetchInstance(
            `admin/account/applications/${applicationId}/resume`,
            { method: "GET", signal: controller.signal },
            "blob",
          );
          const url = URL.createObjectURL(blob);
          if (controller.signal.aborted) {
            URL.revokeObjectURL(url);
            return;
          }
          resumeUrlsRef.current[index] = url;
          setResumeUrls((current) => {
            const next = [...current] as typeof current;
            next[index] = url;
            return next;
          });
        } catch {
          if (!controller.signal.aborted) {
            setResumeUrls((current) => {
              const next = [...current] as typeof current;
              next[index] = null;
              return next;
            });
          }
        }
      };
      const [left, right, questionData] = await Promise.all([
          fetchInstance(
            `admin/account/applications/${nextPair.left.application_id}`,
            { signal: controller.signal },
          ),
          fetchInstance(
            `admin/account/applications/${nextPair.right.application_id}`,
            { signal: controller.signal },
          ),
          questionsRef.current.length > 0
            ? Promise.resolve(questionsRef.current)
            : fetchInstance("forms/questions", { signal: controller.signal }),
        ]);
      if (controller.signal.aborted) return;
      setPair(nextPair);
      setDetails([left, right]);
      setQuestions(questionData);
      questionsRef.current = questionData;
      setLoading(false);
      void loadResume(nextPair.left.application_id, 0);
      void loadResume(nextPair.right.application_id, 1);
    } catch (caught) {
      if (controller.signal.aborted) return;
      setPair(null);
      setDetails([]);
      setError(caught instanceof Error ? caught.message : "Unable to load a pair");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) void loadPair();
  }, [isAuthenticated, loadPair]);

  async function chooseWinner(winnerApplicationId: string) {
    if (!pair || submitting) return;
    setSubmitting(true);
    try {
      await fetchInstance("admin/judging/decisions", {
        method: "POST",
        body: JSON.stringify({
          request_id: crypto.randomUUID(),
          left_application_id: pair.left.application_id,
          right_application_id: pair.right.application_id,
          winner_application_id: winnerApplicationId,
        }),
      });
      toast.success("Ranking recorded");
      await loadPair();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Failed to rank pair");
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Rank Applications</h1>
            <p className="mt-2 text-muted-foreground">
              Review both applications and choose the stronger one. Rankings are
              shared globally; judge reliability is tracked per admin account.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center">Loading applications…</div>
          ) : error ? (
            <div className="space-y-4 rounded-lg border p-8 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={() => void loadPair()}>
                Try again
              </Button>
            </div>
          ) : pair && details.length === 2 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ApplicationCard
                side="A"
                detail={details[0]}
                resumeUrl={resumeUrls[0]}
                questions={questions}
                disabled={submitting}
                onChoose={() => void chooseWinner(pair.left.application_id)}
              />
              <ApplicationCard
                side="B"
                detail={details[1]}
                resumeUrl={resumeUrls[1]}
                questions={questions}
                disabled={submitting}
                onChoose={() => void chooseWinner(pair.right.application_id)}
              />
            </div>
          ) : null}
        </div>
      </main>
  );
}
