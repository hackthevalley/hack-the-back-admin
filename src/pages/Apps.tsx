import { Applicants } from "@/components/Applicants";
import { useApplicants } from "@/utils/useApplicants";
import { useEffect, useState } from "react";

function Apps() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [levelOfStudy, setLevelOfStudy] = useState("");
  const [gender, setGender] = useState("");
  const [utsc, setUTSC] = useState("");
  const [dateSort, setDateSort] = useState("");
  const [role, setRole] = useState<string>("");
  const [rankingSort, setRankingSort] = useState("");
  const { applicants, refreshApplicants } = useApplicants();

  // Refetch applicants when any filter changes
  useEffect(() => {
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
  }, [
    offset,
    search,
    levelOfStudy,
    gender,
    utsc,
    dateSort,
    role,
    rankingSort,
    refreshApplicants,
  ]);

  return (
      <main className="min-w-0 flex-1 overflow-auto">
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
      </main>
  );
}

export default Apps;
