import { useContext, useEffect } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import StatusChart from "@/components/StatusChart";
import { useApplicants } from "@/utils/useApplicants";

function Home() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  const { applicants, refreshAllApplicants } = useApplicants();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    refreshAllApplicants().catch((error) => console.error(error));
  }, [refreshAllApplicants]);

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <NavMenu />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Applicant overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Distribution across all {applicants.length.toLocaleString()} applications
          </p>
        </header>
        <div className="grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-2">
          <StatusChart title="Applicants by Status" field="status" />
          <StatusChart
            title="Applicants by School"
            field="school"
            maxCategories={8}
          />
          <StatusChart
            title="Applicants by Level of Study"
            field="level_of_study"
            maxCategories={8}
          />
          <StatusChart title="Applicants by Gender" field="gender" />
        </div>
      </main>
    </div>
  );
}

export default Home;
