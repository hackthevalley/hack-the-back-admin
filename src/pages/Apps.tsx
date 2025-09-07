/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import { Applicants, ApplicantProps } from "@/components/Applicants";
import fetchInstance from "@/utils/api";

function Apps() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const [applicants, setApplicants] = useState<ApplicantProps[]>([]);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();

  const getAllApps = async (
    ofs = offset,
    limit = 25
  ): Promise<ApplicantProps[]> => {
    try {
      const data = await fetchInstance(
        `admin/account/getallapps?ofs=${ofs}&limit=${limit}`,
        { method: "GET" }
      );
      console.log(data.application);
      setApplicants(
        data.application.map((app: any) => ({
          first_name: app.first_name,
          last_name: app.last_name,
          email: app.email ?? "",
          status: app.status ?? "unknown",
          app_id: app.app_id ?? "unknown",
          created_at: app.created_at ?? "unknown",
          updated_at: app.updated_at ?? "unknown",
        }))
      );
      console.log(applicants);
      return applicants;
    } catch (error) {
      console.error("Error fetching applicants:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    getAllApps().catch((err) => console.log(err.message));
  }, [offset]);

  return (
    <div className="flex h-screen">
      <NavMenu />
      <Applicants
        applicants={applicants}
        setOffset={setOffset}
        offset={offset}
      />
    </div>
  );
}

export default Apps;
