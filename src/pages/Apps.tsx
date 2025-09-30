/* eslint-disable @typescript-eslint/no-explicit-any */
import { Applicants } from "@/components/Applicants";
import { useApplicants } from "@/utils/ApplicantsContext";
import NavMenu from "@/components/Navmenu";
import { UserContext } from "@/utils/auth";
import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";

function Apps() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [utsc, setUTSC] = useState("");
  const [dateSort, setDateSort] = useState("");
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();
  const { applicants } = useApplicants();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const filteredApplicants = useMemo(() => {
    let filtered = applicants.filter((a) => {
      const matchesSearch =
        !search ||
        a.first_name.toLowerCase().includes(search.toLowerCase()) ||
        a.last_name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      let matchesAge = true;
      if (age && age.includes("-")) {
        const [minAge, maxAge] = age.split("-").map(Number);
        const applicantAge = a.age ? parseInt(a.age) : null;
        matchesAge =
          applicantAge !== null &&
          applicantAge >= minAge &&
          applicantAge <= maxAge;
      }
      const matchesGender = !gender || a.gender === gender;
      const matchesSchool = !utsc || a.school === utsc;
      const matchesStatus = !role || a.status === role;

      return (
        matchesSearch &&
        matchesAge &&
        matchesGender &&
        matchesSchool &&
        matchesStatus
      );
    });
    if (dateSort === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (dateSort === "latest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return filtered;
  }, [applicants, search, age, gender, utsc, role, dateSort]);

  return (
    <div className="flex h-screen w-full">
      <NavMenu />
      <Applicants
        applicants={filteredApplicants}
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
        role={role}
        setRole={setRole}
      />
    </div>
  );
}

export default Apps;
