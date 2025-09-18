/* eslint-disable @typescript-eslint/no-explicit-any */
import { Applicants, ApplicantProps } from "@/components/Applicants";
import NavMenu from "@/components/Navmenu";
import fetchInstance from "@/utils/api";
import { UserContext } from "@/utils/auth";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

function Apps() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const [applicants, setApplicants] = useState<ApplicantProps[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [utsc, setUTSC] = useState("");
  const [dateSort, setDateSort] = useState("");
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();

  const getAllApps = async (
    ofs = offset,
    limit = 25,
    query = search,
    ageFilter = age,
    genderFilter = gender,
    schoolFilter = utsc,
    dateSortFilter = dateSort,
    roleFilter = role
  ): Promise<ApplicantProps[]> => {
    try {
      const params = new URLSearchParams({
        ofs: ofs.toString(),
        limit: limit.toString(),
      });

      if (query) params.append("search", query);
      if (ageFilter) params.append("age", ageFilter);
      if (genderFilter) params.append("gender", genderFilter);
      if (schoolFilter) params.append("school", schoolFilter);
      if (dateSortFilter) params.append("date_sort", dateSortFilter);
      if (roleFilter) params.append("role", roleFilter);

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
          school: app.school ?? "unknown",
          role: app.role ?? "unknown",
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
    getAllApps(offset, 25, search, age, gender, utsc, dateSort).catch((err) =>
      console.log(err.message)
    );
  }, [offset, search, age, gender, utsc, dateSort, role]);

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
        utsc={utsc}
        setUTSC={setUTSC}
        dateSort={dateSort}
        setDateSort={setDateSort}
        role={role} // new
        setRole={setRole} // new
      />
    </div>
  );
}

export default Apps;
