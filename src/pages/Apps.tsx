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
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const navigate = useNavigate();

  const getAllApps = async (
    ofs = offset,
    limit = 25,
    query = search,
    ageFilter = age,
    genderFilter = gender
  ): Promise<ApplicantProps[]> => {
    try {
      const params = new URLSearchParams({
        ofs: ofs.toString(),
        limit: limit.toString(),
      });

      if (query) params.append("search", query);
      if (ageFilter) params.append("age", ageFilter);
      if (genderFilter) params.append("gender", genderFilter);

      const data = await fetchInstance(
        `admin/account/getallapps?${params.toString()}`,
        { method: "GET" }
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
        }))
      );
      return applicants;
    } catch (error) {
      console.error("Error fetching applicants:", error);
      throw error;
    }
  };
  useEffect(() => {
    getAllApps(offset, 25, search, age, gender).catch((err) =>
      console.log(err.message)
    );
  }, [offset, search, age, gender]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen w-full">
      <NavMenu />
      <Applicants
        applicants={applicants}
        setOffset={setOffset}
        offset={offset}
        search={search}
        setSearch={setSearch}
        age={age}
        setAge={setAge}
        gender={gender}
        setGender={setGender}
      />
    </div>
  );
}

export default Apps;
