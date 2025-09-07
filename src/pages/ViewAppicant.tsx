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
  application: Record<string, any>;
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
    fetchInstance(`admin/account/file/${app_id}`, {
      method: "GET",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch resume");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
      })
      .catch(() => setError("Failed to fetch resume"));
  }, [app_id]);

  if (!applicant) return <p>{error}</p>;

  const sections: Record<string, Question[]> = {};
  SECTIONS.forEach((s) => {
    sections[s] = questions.filter((q) => q.section === s);
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Applicant Details</h1>

      {/* PROFILE SECTION + RESUME*/}
      {(() => {
        const [start, end] = SECTION_RANGES["Profile"];
        const profileQuestions = questions.slice(start, end + 1);
        return (
          <div className="bg-gray-800 p-4 rounded shadow space-y-2">
            <ul className=" list-inside space-y-1">
              {profileQuestions.map((q) => {
                const answerObj = applicant.form_answers.find(
                  (a) => a.question_id === q.question_id
                );
                return (
                  <li key={q.question_id}>
                    <strong>{q.label}:</strong>{" "}
                    {answerObj ? answerObj.answer : "No answer"}
                  </li>
                );
              })}
            </ul>
            {resumeUrl ? (
              <iframe
                src={resumeUrl}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                title="Resume Preview"
              />
            ) : (
              <p>{error || "Loading resume..."}</p>
            )}
          </div>
        );
      })()}

      <Accordion.Root type="multiple" className="space-y-2">
        {SECTIONS.filter((s) => s !== "Profile" && s !== "Resume").map(
          (sectionName) => {
            const [start, end] = SECTION_RANGES[sectionName];
            const sectionQuestions = questions.slice(start, end + 1);

            if (!sectionQuestions || sectionQuestions.length === 0) return null;

            return (
              <Accordion.Item key={sectionName} value={sectionName}>
                <Accordion.Header>
                  <Accordion.Trigger className="flex justify-between w-full p-4 bg-gray-700 rounded text-left">
                    {sectionName}
                    <ChevronDown className="w-5 h-5" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="p-4 bg-gray-800 rounded-b">
                  <ul className="list-disc list-inside space-y-1">
                    {sectionQuestions.map((q) => {
                      const answerObj = applicant.form_answers.find(
                        (a) => a.question_id === q.question_id
                      );
                      return (
                        <li key={q.question_id}>
                          <strong>{q.label}:</strong>{" "}
                          {answerObj && answerObj.answer
                            ? answerObj.answer
                            : "N/A"}
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
