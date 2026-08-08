import { useContext } from "react";

import { ApplicantsContext } from "./applicants-context";

export function useApplicants() {
  const context = useContext(ApplicantsContext);
  if (!context) {
    throw new Error("useApplicants must be used within ApplicantsProvider");
  }
  return context;
}
