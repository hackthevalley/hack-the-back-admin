import { useContext, useEffect, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";

import fetchInstance from "@/utils/api";
import { useParams } from "react-router";

interface Question {
  question_id: string;
  label: string;
  section: string;
}

interface FormAnswer {
  question_id: string;
  answer: string;
}

interface FormAnswerfile {
  original_filename: string;
  file_path: string;
}

interface Applicant {
  application: Record<string, unknown>;
  form_answers: FormAnswer[];
  form_answersfile: FormAnswerfile;
}

const SECTIONS = [
  "Profile",
  "Resume",
  "School",
  "Demography",
  "Experience",
  "Skill",
  "General",
  "MLH",
];

const SECTION_RANGES: Record<string, [number, number]> = {
  Profile: [0, 3],
  School: [4, 8],
  Demography: [9, 13],
  Experience: [14, 17],
  Skill: [19, 26],
  General: [27, 28],
  MLH: [31, 31],
};

export default function ViewApplicant() {
  const { app_id } = useParams<{ app_id: string }>();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useContext(UserContext) ?? {};

  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!app_id) return;
    fetchInstance(`admin/account/getapplication?application_id=${app_id}`, {
      method: "GET",
    })
      .then((applicationData) => {
        setApplicant(applicationData);
        console.log(applicant);
      })
      .catch(() => setError("Failed to fetch applicant"));
  }, [app_id]);

  useEffect(() => {
    fetchInstance("forms/getquestions")
      .then((questionsData) => {
        setQuestions(questionsData);
      })
      .catch(() => setError("Failed to fetch questions"));
  }, []);

  useEffect(() => {
    if (!app_id) return;

    fetchInstance(`admin/account/file/${app_id}`, { method: "GET" }, "blob")
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
      })
      .catch(() => setError("Failed to fetch resume"));
  }, [app_id]);

  if (!applicant)
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-destructive text-center text-lg">{error}</p>
      </div>
    );

  const sections: Record<string, Question[]> = {};
  SECTIONS.forEach((s) => {
    sections[s] = questions.filter((q) => q.section === s);
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Applicant Details</h1>

      {/* PROFILE SECTION + RESUME*/}
      {(() => {
        const [start, end] = SECTION_RANGES["Profile"];
        const profileQuestions = questions.slice(start, end + 1);
        return (
          <div className="bg-card p-4 rounded-lg shadow-md border border-border space-y-2">
            <ul className="list-inside space-y-1 text-card-foreground">
              {profileQuestions.map((q) => {
                const answerObj = applicant.form_answers.find(
                  (a) => a.question_id === q.question_id
                );
                return (
                  <li key={q.question_id} className="text-sm">
                    <strong className="text-foreground font-semibold">
                      {q.label}:
                    </strong>{" "}
                    <span className="text-muted-foreground">
                      {answerObj &&
                      answerObj.answer &&
                      answerObj.answer.trim() !== ""
                        ? answerObj.answer
                        : q.label.toLowerCase().includes("phone")
                        ? "N/A"
                        : "No answer"}
                    </span>
                  </li>
                );
              })}
            </ul>
            {resumeUrl ? (
              <div className="mt-4 rounded-lg overflow-hidden border border-border">
                <iframe
                  src={resumeUrl}
                  width="100%"
                  height="600px"
                  style={{ border: "none" }}
                  title="Resume Preview"
                  className="bg-background"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {error || "Loading resume..."}
              </p>
            )}
          </div>
        );
      })()}

      <Accordion.Root
        type="multiple"
        defaultValue={SECTIONS.filter((s) => s !== "Profile" && s !== "Resume")}
        className="space-y-2"
      >
        {SECTIONS.filter((s) => s !== "Profile" && s !== "Resume").map(
          (sectionName) => {
            const [start, end] = SECTION_RANGES[sectionName];
            const sectionQuestions = questions.slice(start, end + 1);

            if (!sectionQuestions || sectionQuestions.length === 0) return null;

            return (
              <Accordion.Item key={sectionName} value={sectionName}>
                <Accordion.Header>
                  <Accordion.Trigger className="flex justify-between w-full p-4 bg-muted hover:bg-accent rounded-lg text-left transition-all duration-300 ease-in-out group">
                    <span className="font-medium text-foreground">
                      {sectionName}
                    </span>
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="p-4 bg-muted/50 border border-border rounded-b-lg overflow-hidden data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=closed]:translate-y-[-10px] data-[state=open]:translate-y-0 data-[state=closed]:max-h-0 data-[state=open]:max-h-[1000px] transition-all duration-500 ease-in-out">
                  <ul className="list-disc list-inside space-y-1 text-card-foreground">
                    {sectionQuestions.map((q) => {
                      const answerObj = applicant.form_answers.find(
                        (a) => a.question_id === q.question_id
                      );
                      return (
                        <li key={q.question_id} className="text-sm">
                          <strong className="text-foreground font-semibold">
                            {q.label}:
                          </strong>{" "}
                          <span className="text-muted-foreground">
                            {answerObj &&
                            answerObj.answer &&
                            answerObj.answer.trim() !== ""
                              ? answerObj.answer
                              : q.label.toLowerCase().includes("phone")
                              ? "N/A"
                              : "N/A"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Accordion.Content>
              </Accordion.Item>
            );
          }
        )}
      </Accordion.Root>
    </div>
  );
}
