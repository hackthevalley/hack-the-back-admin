import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
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

export type ApplicantsQueryParams = {
  offset?: number;
  limit?: number;
  search?: string;
  level_of_study?: string;
  gender?: string;
  school?: string;
  dateSort?: string;
  role?: string;
};

type ApplicantsContextType = {
  applicants: ApplicantProps[];
  refreshApplicants: (params?: ApplicantsQueryParams) => Promise<void>;
};

const ApplicantsContext = createContext<ApplicantsContextType | undefined>(
  undefined
);

export function ApplicantsProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<ApplicantProps[]>([]);

  const refreshApplicants = useCallback(
    async (params?: ApplicantsQueryParams) => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("ofs", (params?.offset ?? 0).toString());
        queryParams.append("limit", (params?.limit ?? 25).toString());

        if (params?.search) queryParams.append("search", params.search);
        if (params?.level_of_study)
          queryParams.append("level_of_study", params.level_of_study);
        if (params?.gender) queryParams.append("gender", params.gender);
        if (params?.school) queryParams.append("school", params.school);
        if (params?.dateSort) queryParams.append("date_sort", params.dateSort);
        if (params?.role) queryParams.append("role", params.role);

        const data = await fetchInstance(
          `admin/account/getallapps?${queryParams.toString()}`,
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
    },
    []
  );

  useEffect(() => {
    refreshApplicants();
  }, [refreshApplicants]);

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
