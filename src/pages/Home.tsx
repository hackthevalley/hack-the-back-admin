import { useEffect } from "react";
import StatusChart from "@/components/StatusChart";
import { useApplicants } from "@/context/useApplicants";

function Home() {
  const {
    allApplicants: applicants,
    applicantsError,
    isLoadingApplicants,
    refreshAllApplicants,
  } = useApplicants();

  useEffect(() => {
    void refreshAllApplicants().catch(() => undefined);
  }, [refreshAllApplicants]);

  return (
    <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Applicant overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Distribution across all {applicants.length.toLocaleString()}{" "}
          applications
        </p>
      </header>
      {applicantsError ? (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{applicantsError}</p>
          <button
            type="button"
            className="text-sm font-medium underline"
            onClick={() => void refreshAllApplicants(true)}
          >
            Retry
          </button>
        </div>
      ) : null}
      {isLoadingApplicants && applicants.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Loading applicants…
        </p>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-2">
          <StatusChart
            title="Applicants by Status"
            field="status"
            applicants={applicants}
            isLoading={isLoadingApplicants}
          />
          <StatusChart
            title="Applicants by School"
            field="school"
            maxCategories={8}
            applicants={applicants}
            isLoading={isLoadingApplicants}
          />
          <StatusChart
            title="Applicants by Level of Study"
            field="level_of_study"
            maxCategories={8}
            applicants={applicants}
            isLoading={isLoadingApplicants}
          />
          <StatusChart
            title="Applicants by Gender"
            field="gender"
            applicants={applicants}
            isLoading={isLoadingApplicants}
          />
        </div>
      )}
    </main>
  );
}

export default Home;
