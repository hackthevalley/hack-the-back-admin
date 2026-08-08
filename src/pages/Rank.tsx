import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getApplication,
  getApplicationResume,
  getJudgingPair,
  getQuestions,
  submitJudgingDecision,
} from "@/api/admin";

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
    (question) => !HIDDEN_QUESTION_LABELS.has(question.label.trim().toLowerCase()),
  );

  return (
    <Card className={`flex min-h-0 flex-col ${expanded ? "h-full overflow-hidden" : ""}`}>
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

export default function Rank() {
  const [pair, setPair] = useState<Pair | null>(null);
  const [details, setDetails] = useState<ApplicationDetail[]>([]);
  const [resumeUrls, setResumeUrls] = useState<
    [string | null | undefined, string | null | undefined]
  >([undefined, undefined]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const questionsRef = useRef<Question[]>([]);
  const resumeUrlsRef = useRef<(string | null)[]>([]);
  const loadControllerRef = useRef<AbortController | null>(null);
  const rankPageRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsExpanded(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
      const nextPair = await getJudgingPair<Pair>(controller.signal);
      const loadResume = async (applicationId: string, index: 0 | 1) => {
        try {
          const blob = await getApplicationResume(applicationId, controller.signal);
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
          getApplication<ApplicationDetail>(nextPair.left.application_id, controller.signal),
          getApplication<ApplicationDetail>(nextPair.right.application_id, controller.signal),
          questionsRef.current.length > 0
            ? Promise.resolve(questionsRef.current)
            : getQuestions<Question[]>(controller.signal),
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
    void loadPair();
  }, [loadPair]);

  async function chooseWinner(winnerApplicationId: string) {
    if (!pair || submitting) return;
    setSubmitting(true);
    try {
      await submitJudgingDecision({
        request_id: crypto.randomUUID(),
        left_application_id: pair.left.application_id,
        right_application_id: pair.right.application_id,
        winner_application_id: winnerApplicationId,
      });
      toast.success("Ranking recorded");
      await loadPair();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Failed to rank pair");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleExpanded() {
    if (isExpanded) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    try {
      await rankPageRef.current?.requestFullscreen();
    } catch {
      // The fixed full-viewport layout remains as a fallback on browsers that
      // do not allow element fullscreen, including some mobile Safari versions.
    }
  }

  return (
      <main
        ref={rankPageRef}
        className={`${isExpanded ? "fixed inset-0 z-[100] overflow-hidden bg-background" : "min-w-0 flex-1 overflow-auto"} p-4 sm:p-8`}
      >
        <div
          className={
            isExpanded
              ? "flex h-full max-w-none flex-col overflow-hidden"
              : "mx-auto max-w-7xl"
          }
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Rank Applications</h1>
              <p className="mt-2 text-muted-foreground">
                Review both applications and choose the stronger one. Rankings are
                shared globally; judge reliability is tracked per admin account.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void toggleExpanded()}
              className="shrink-0 cursor-pointer gap-2"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              {isExpanded ? "Exit fullscreen" : "Fullscreen"}
            </Button>
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
            <div
              className={`grid gap-6 ${isExpanded ? "min-h-0 flex-1 grid-cols-2 overflow-hidden" : "lg:grid-cols-2"}`}
            >
              <ApplicationCard
                side="A"
                detail={details[0]}
                resumeUrl={resumeUrls[0]}
                questions={questions}
                disabled={submitting}
                expanded={isExpanded}
                onChoose={() => void chooseWinner(pair.left.application_id)}
              />
              <ApplicationCard
                side="B"
                detail={details[1]}
                resumeUrl={resumeUrls[1]}
                questions={questions}
                disabled={submitting}
                expanded={isExpanded}
                onChoose={() => void chooseWinner(pair.right.application_id)}
              />
            </div>
          ) : null}
        </div>
      </main>
  );
}
