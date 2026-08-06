import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import NavMenu from "@/components/Navmenu";
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
  resumeUrl: string | null;
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
              {resumeUrl ? (
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
          className="cursor-pointer transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:pointer-events-auto disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:active:scale-100"
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
  const [resumeUrls, setResumeUrls] = useState<(string | null)[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const questionsRef = useRef<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(
    () => () => {
      resumeUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    },
    [resumeUrls],
  );

  const loadPair = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextPair: Pair = await fetchInstance("admin/judging/pair");
      const loadResume = async (applicationId: string) => {
        try {
          const blob = await fetchInstance(
            `admin/account/applications/${applicationId}/resume`,
            { method: "GET" },
            "blob",
          );
          return URL.createObjectURL(blob);
        } catch {
          return null;
        }
      };
      const [left, right, leftResumeUrl, rightResumeUrl, questionData] =
        await Promise.all([
          fetchInstance(
            `admin/account/applications/${nextPair.left.application_id}`,
          ),
          fetchInstance(
            `admin/account/applications/${nextPair.right.application_id}`,
          ),
          loadResume(nextPair.left.application_id),
          loadResume(nextPair.right.application_id),
          questionsRef.current.length > 0
            ? Promise.resolve(questionsRef.current)
            : fetchInstance("forms/questions"),
        ]);
      setPair(nextPair);
      setDetails([left, right]);
      setResumeUrls([leftResumeUrl, rightResumeUrl]);
      setQuestions(questionData);
      questionsRef.current = questionData;
    } catch (caught) {
      setPair(null);
      setDetails([]);
      setResumeUrls([]);
      setError(caught instanceof Error ? caught.message : "Unable to load a pair");
    } finally {
      setLoading(false);
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
    <div className="flex h-screen w-full overflow-hidden">
      <NavMenu />
      <main className="flex-1 overflow-auto p-4 sm:p-8">
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
          ) : pair && details.length === 2 && resumeUrls.length === 2 ? (
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
    </div>
  );
}
