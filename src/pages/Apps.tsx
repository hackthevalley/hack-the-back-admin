/* eslint-disable @typescript-eslint/no-explicit-any */
import { Applicants } from "@/components/Applicants";
import { useApplicants } from "@/utils/ApplicantsContext";
import NavMenu from "@/components/Navmenu";
import { UserContext } from "@/utils/auth";
import { useContext, useEffect, useState } from "react";
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
  const { applicants, refreshApplicants } = useApplicants();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Refetch applicants when any filter changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshApplicants({
        offset,
        limit: 25,
        search,
        age,
        gender,
        school: utsc,
        dateSort,
        role,
      });
    }
  }, [
    offset,
    search,
    age,
    gender,
    utsc,
    dateSort,
    role,
    isAuthenticated,
    refreshApplicants,
  ]);

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
        role={role}
        setRole={setRole}
      />
    </div>
  );
}

export default Apps;
