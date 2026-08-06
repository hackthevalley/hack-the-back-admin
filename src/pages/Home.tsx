import { useContext, useEffect } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import StatusChart from "@/components/StatusChart";
import { useApplicants } from "@/utils/useApplicants";

function Home() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  const { refreshApplicants } = useApplicants();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    refreshApplicants().catch((err) => console.error(err));
  }, [refreshApplicants]);

  return (
    <div className="flex h-screen gap-16">
      <NavMenu />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 flex-1 overflow-y-auto">
        <StatusChart title="Applicants by Status" field="status" />
        <StatusChart title="Applicants by School" field="school" />
        <StatusChart title="Applicants by Age" field="age" />
        <StatusChart title="Applicants by Gender" field="gender" />
      </div>
    </div>
  );
}

export default Home;
