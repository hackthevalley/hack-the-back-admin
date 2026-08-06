import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { ApplicantFilters } from "@/components/applicants/ApplicantFilters";
import { ApplicantTable } from "@/components/applicants/ApplicantTable";
import { createApplicantColumns } from "@/components/applicants/columns";
import type { Applicant, ApplicantFilterProps } from "@/components/applicants/types";
import { ApplicantStatus } from "@/components/applicants/types";
import { Button } from "@/components/ui/button";
import fetchInstance from "@/utils/api";

export type ApplicantProps = Applicant;

type ApplicantsProps = ApplicantFilterProps & {
  applicants?: Applicant[];
  offset: number;
  setOffset: Dispatch<SetStateAction<number>>;
};

const PAGE_SIZE = 25;

export function Applicants({ applicants, offset, setOffset, ...filters }: ApplicantsProps) {
  const [data, setData] = useState<Applicant[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    setData((applicants ?? []).map(formatApplicantDates));
  }, [applicants]);

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: ApplicantStatus) => {
      setData((current) =>
        current.map((applicant) =>
          applicant.app_id === applicationId
            ? {
                ...applicant,
                status,
                updated_at: formatTorontoDate(new Date().toISOString()),
              }
            : applicant,
        ),
      );
    },
    [],
  );

  const handleApplicantAction = useCallback(
    async (action: ApplicantStatus, applicationId: string) => {
      try {
        const response = await fetchInstance(
          `admin/account/applications/${applicationId}/status?request=${action}`,
          { method: "PATCH" },
        );
        if (response.application_id !== applicationId) {
          toast.warning("Action failed");
          return;
        }
        updateApplicationStatus(applicationId, action);
        showStatusToast(action);
      } catch {
        toast.error("An error occurred while updating the applicant status.");
      }
    },
    [updateApplicationStatus],
  );

  const columns = useMemo(
    () => createApplicantColumns(handleApplicantAction),
    [handleApplicantAction],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const handleBulkAction = async (action: ApplicantStatus) => {
    const selectedApplicants = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    try {
      await Promise.all(
        selectedApplicants.map(async (applicant) => {
          const response = await fetchInstance(
            `admin/account/applications/${applicant.app_id}/status?request=${action}`,
            { method: "PATCH" },
          );
          if (response.application_id === applicant.app_id) {
            updateApplicationStatus(applicant.app_id, action);
          }
        }),
      );
      showStatusToast(action, selectedApplicants.length);
      setRowSelection({});
    } catch {
      toast.error("An error occurred while performing the bulk action.");
    }
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full py-4 px-4 sm:px-6">
      <ApplicantFilters
        table={table}
        setOffset={setOffset}
        {...filters}
      />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-4">
        <BulkActionButton
          label="Accept Selected"
          variant="success"
          disabled={!selectedCount}
          onClick={() => handleBulkAction(ApplicantStatus.ACCEPTED)}
        />
        <BulkActionButton
          label="Reject Selected"
          variant="destructive"
          disabled={!selectedCount}
          onClick={() => handleBulkAction(ApplicantStatus.REJECTED)}
        />
        <BulkActionButton
          label="Waitlist Selected"
          variant="default"
          disabled={!selectedCount}
          onClick={() => handleBulkAction(ApplicantStatus.WAITLISTED)}
        />
      </div>
      <ApplicantTable
        table={table}
        columnCount={columns.length}
        offset={offset}
        setOffset={setOffset}
        pageSize={PAGE_SIZE}
        resultCount={data.length}
      />
    </div>
  );
}

function BulkActionButton({
  label,
  variant,
  disabled,
  onClick,
}: {
  label: string;
  variant: "default" | "destructive" | "success";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      className="w-full sm:w-auto"
    >
      {label}
    </Button>
  );
}

function formatApplicantDates(applicant: Applicant): Applicant {
  return {
    ...applicant,
    created_at: formatTorontoDate(applicant.created_at),
    updated_at: formatTorontoDate(applicant.updated_at),
  };
}

function formatTorontoDate(input: string): string {
  if (!input || input === "unknown" || input === "N/A") return "N/A";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Toronto",
  }).format(date);
}

function showStatusToast(action: ApplicantStatus, count?: number) {
  const subject = count === undefined ? "Applicant" : `${count} applicant(s)`;
  if (action === ApplicantStatus.ACCEPTED) {
    toast.success(`${subject} accepted`, {
      icon: <CheckCircle className="text-green-500" />,
    });
  } else if (action === ApplicantStatus.WAITLISTED) {
    toast(`${subject} waitlisted`, {
      icon: <AlertTriangle className="text-yellow-500" />,
    });
  } else if (action === ApplicantStatus.REJECTED) {
    toast.error(`${subject} rejected`, {
      icon: <XCircle className="text-red-500" />,
    });
  } else {
    toast("Status updated");
  }
}
