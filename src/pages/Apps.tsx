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
  const [levelOfStudy, setLevelOfStudy] = useState("");
  const [gender, setGender] = useState("");
  const [utsc, setUTSC] = useState("");
  const [dateSort, setDateSort] = useState("");
  const [role, setRole] = useState<string>("");
  const [rankingSort, setRankingSort] = useState("");
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
        level_of_study: levelOfStudy,
        gender,
        school: utsc,
        dateSort,
        role,
        rankingSort,
      });
    }
  }, [
    offset,
    search,
    levelOfStudy,
    gender,
    utsc,
    dateSort,
    role,
    rankingSort,
    isAuthenticated,
    refreshApplicants,
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NavMenu />
      <div className="flex-1 overflow-auto">
        <Applicants
          applicants={applicants}
          setOffset={setOffset}
          offset={offset}
          search={search}
          setSearch={setSearch}
          levelOfStudy={levelOfStudy}
          setLevelOfStudy={setLevelOfStudy}
          gender={gender}
          setGender={setGender}
          utsc={utsc}
          setUTSC={setUTSC}
          dateSort={dateSort}
          setDateSort={setDateSort}
          role={role}
          setRole={setRole}
          rankingSort={rankingSort}
          setRankingSort={setRankingSort}
        />
      </div>
    </div>
  );
}

export default Apps;
