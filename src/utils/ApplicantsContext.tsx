import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import fetchInstance from "@/utils/api";

export type ApplicantProps = {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  app_id: string;
  created_at: string;
  updated_at: string;
  age?: string;
  gender?: string;
  school?: string;
  role?: string;
};

type ApplicantsContextType = {
  applicants: ApplicantProps[];
  refreshApplicants: () => Promise<void>;
};

const ApplicantsContext = createContext<ApplicantsContextType | undefined>(
  undefined
);

export function ApplicantsProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<ApplicantProps[]>([]);

  const refreshApplicants = async () => {
    try {
      const data = await fetchInstance(
        "admin/account/getallapps?ofs=0&limit=100",
        {
          method: "GET",
        }
      );

      setApplicants(
        data.application.map((app: any) => ({
          first_name: app.first_name,
          last_name: app.last_name,
          email: app.email ?? "",
          status: app.status ?? "unknown",
          app_id: app.app_id ?? "unknown",
          created_at: app.created_at ?? "unknown",
          updated_at: app.updated_at ?? "unknown",
          age: app.age ?? "unknown",
          gender: app.gender ?? "unknown",
          school: app.school ?? "unknown",
        }))
      );
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  useEffect(() => {
    refreshApplicants();
  }, []);

  return (
    <ApplicantsContext.Provider value={{ applicants, refreshApplicants }}>
      {children}
    </ApplicantsContext.Provider>
  );
}

export function useApplicants() {
  const ctx = useContext(ApplicantsContext);
  if (!ctx)
    throw new Error("useApplicants must be used within ApplicantsProvider");
  return ctx;
}
