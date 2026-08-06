import { useState } from "react";
import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import type { Applicant, ApplicantFilterProps } from "./types";
import { ApplicantStatus } from "./types";

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Other",
  "Prefer not to say",
];

const STUDY_LEVEL_OPTIONS = [
  "High School",
  "Freshman - Undergraduate",
  "Sophomore - Undergraduate",
  "Junior - Undergraduate",
  "Senior - Undergraduate",
  "Graduate",
  "PhD",
  "Other",
];

type ApplicantFiltersProps = ApplicantFilterProps & {
  table: Table<Applicant>;
};

export function ApplicantFilters({
  table,
  search,
  setSearch,
  levelOfStudy,
  setLevelOfStudy,
  gender,
  setGender,
  utsc,
  setUTSC,
  dateSort,
  setDateSort,
  role,
  setRole,
  rankingSort,
  setRankingSort,
  setOffset,
}: ApplicantFiltersProps) {
  const [searchInput, setSearchInput] = useState(search);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const runSearch = () => {
    setSearch(searchInput);
    setOffset(0);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setLevelOfStudy("");
    setGender("");
    setUTSC("");
    setDateSort("");
    setRole("");
    setRankingSort("");
    setOffset(0);
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
          <Input
            placeholder="Search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && runSearch()}
            className="w-full sm:max-w-xs"
          />
          <Button onClick={runSearch} className="w-full sm:w-auto">
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced((visible) => !visible)}
            className="w-full sm:w-auto"
          >
            {showAdvanced ? "Hide Advanced" : "Advanced Filters"}
          </Button>

          <FilterMenu
            label={
              dateSort === "oldest"
                ? "Oldest First"
                : dateSort === "latest"
                  ? "Latest First"
                  : "Sort by Date"
            }
            width="sm:min-w-[150px]"
          >
            <DropdownMenuItem onClick={() => setDateSort("")}>
              No Date Sort
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(["oldest", "latest"] as const).map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => {
                  setDateSort(value);
                  setRankingSort("");
                }}
              >
                {value === "oldest" ? "Oldest First" : "Latest First"}
              </DropdownMenuItem>
            ))}
          </FilterMenu>

          <FilterMenu
            label={
              rankingSort === "highest"
                ? "Highest Rated"
                : rankingSort === "lowest"
                  ? "Lowest Rated"
                  : "Sort by Rating"
            }
            width="sm:min-w-[170px]"
          >
            <DropdownMenuItem onClick={() => setRankingSort("")}>
              No Rating Sort
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(["highest", "lowest"] as const).map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => {
                  setRankingSort(value);
                  setDateSort("");
                }}
              >
                {value === "highest" ? "Highest Rated" : "Lowest Rated"}
              </DropdownMenuItem>
            ))}
          </FilterMenu>

          <FilterMenu
            label={role ? role.replace(/_/g, " ") : "Filter by Status"}
            width="sm:min-w-[150px]"
          >
            <DropdownMenuItem onClick={() => setRole("")}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.values(ApplicantStatus).map((status) => (
              <DropdownMenuItem key={status} onClick={() => setRole(status)}>
                {status.replace(/_/g, " ")}
              </DropdownMenuItem>
            ))}
          </FilterMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showAdvanced && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center py-2 gap-2">
          <OptionsMenu
            label={levelOfStudy || "All Study Levels"}
            emptyLabel="All Study Levels"
            options={STUDY_LEVEL_OPTIONS}
            onSelect={setLevelOfStudy}
            width="sm:min-w-[200px]"
          />
          <OptionsMenu
            label={
              utsc === "University of Toronto (Scarborough)"
                ? "UTSC Only"
                : "All Schools"
            }
            emptyLabel="All Schools"
            options={["University of Toronto (Scarborough)"]}
            optionLabels={{ "University of Toronto (Scarborough)": "UTSC Only" }}
            onSelect={setUTSC}
          />
          <OptionsMenu
            label={gender || "All Genders"}
            emptyLabel="All Genders"
            options={GENDER_OPTIONS}
            onSelect={setGender}
          />
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
}

function FilterMenu({
  label,
  width = "sm:min-w-[150px]",
  children,
}: {
  label: string;
  width?: string;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full sm:w-auto ${width} justify-between`}
        >
          {label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function OptionsMenu({
  label,
  emptyLabel,
  options,
  optionLabels = {},
  onSelect,
  width,
}: {
  label: string;
  emptyLabel: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onSelect: (value: string) => void;
  width?: string;
}) {
  return (
    <FilterMenu label={label} width={width}>
      <DropdownMenuItem onClick={() => onSelect("")}>
        {emptyLabel}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {options.map((option) => (
        <DropdownMenuItem key={option} onClick={() => onSelect(option)}>
          {optionLabels[option] ?? option}
        </DropdownMenuItem>
      ))}
    </FilterMenu>
  );
}
