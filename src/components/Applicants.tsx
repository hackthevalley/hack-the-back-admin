import { useCallback, useEffect, useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { ApplicantFilters } from "@/components/applicants/ApplicantFilters";
import { ApplicantTable } from "@/components/applicants/ApplicantTable";
import { createApplicantColumns } from "@/components/applicants/columns";
import type {
  Applicant,
  ApplicantFiltersState,
  SetApplicantFilters,
} from "@/components/applicants/types";
import { ApplicantStatus } from "@/components/applicants/types";
import { applicantTableFeatures } from "@/components/applicants/tableFeatures";
import { Button } from "@/components/ui/button";
import { updateApplicationStatus as updateApplicationStatusRequest } from "@/api/admin";
import { useApplicants } from "@/context/useApplicants";

type ApplicantsProps = {
  applicants?: Applicant[];
  filters: ApplicantFiltersState;
  setFilters: SetApplicantFilters;
};

const PAGE_SIZE = 25;

export function Applicants({
  applicants,
  filters,
  setFilters,
}: ApplicantsProps) {
  const { updateApplicantStatus } = useApplicants();
  const [data, setData] = useState<Applicant[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    setData((applicants ?? []).map(formatApplicantDates));
  }, [applicants]);

  const applyApplicationStatus = useCallback(
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
      updateApplicantStatus(applicationId, status);
    },
    [updateApplicantStatus],
  );

  const handleApplicantAction = useCallback(
    async (action: ApplicantStatus, applicationId: string) => {
      try {
        const response = await updateApplicationStatusRequest(
          applicationId,
          action,
        );
        if (response.application_id !== applicationId) {
          toast.warning("Action failed");
          return;
        }
        applyApplicationStatus(applicationId, action);
        showStatusToast(action);
      } catch {
        toast.error("An error occurred while updating the applicant status.");
      }
    },
    [applyApplicationStatus],
  );

  const columns = useMemo(
    () =>
      createApplicantColumns((status, applicationId) => {
        void handleApplicantAction(status, applicationId);
      }),
    [handleApplicantAction],
  );

  const table = useTable({
    features: applicantTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const handleBulkAction = async (action: ApplicantStatus) => {
    const selectedApplicants = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    try {
      await Promise.all(
        selectedApplicants.map(async (applicant) => {
          const response = await updateApplicationStatusRequest(
            applicant.app_id,
            action,
          );
          if (response.application_id === applicant.app_id) {
            applyApplicationStatus(applicant.app_id, action);
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
        filters={filters}
        setFilters={setFilters}
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
        offset={filters.offset}
        setOffset={(nextOffset) => {
          setFilters((current) => ({
            ...current,
            offset:
              typeof nextOffset === "function"
                ? nextOffset(current.offset)
                : nextOffset,
          }));
        }}
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
  const subject =
    count === undefined ? "Applicant" : `${String(count)} applicant(s)`;
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
