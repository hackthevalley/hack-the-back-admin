import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Applicant } from "./types";
import { ApplicantStatus } from "./types";
import { applicantTableFeatures } from "./tableFeatures";

type ApplicantAction = (status: ApplicantStatus, applicationId: string) => void;
type ApplicantColumnDef = ColumnDef<
  typeof applicantTableFeatures,
  Applicant,
  unknown
>;

function sortableHeader(label: string, onClick: () => void) {
  return (
    <Button variant="ghost" onClick={onClick}>
      {label}
      <ArrowUpDown />
    </Button>
  );
}

export function createApplicantColumns(
  onAction: ApplicantAction,
): ApplicantColumnDef[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          className="border-primary"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          className="border-primary"
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...(["first_name", "last_name", "email", "gender", "school"] as const).map(
      (key): ApplicantColumnDef => ({
        accessorKey: key,
        header: ({ column }) => (
          sortableHeader(
            key.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
            () => column.toggleSorting(column.getIsSorted() === "asc"),
          )
        ),
        cell: ({ row }) => (
          <div className={key === "email" ? "lowercase" : "capitalize"}>
            {String(row.getValue(key) || "N/A")}
          </div>
        ),
      }),
    ),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
    },
    {
      accessorKey: "ranking_mu",
      header: "Crowd-BT Rating",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.ranking_mu == null
              ? "Unranked"
              : row.original.ranking_mu.toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.ranking_comparison_count ?? 0} comparisons
          </div>
        </div>
      ),
    },
    ...(["created_at", "updated_at"] as const).map(
      (key): ApplicantColumnDef => ({
        accessorKey: key,
        header: ({ column }) => (
          sortableHeader(
            key === "created_at" ? "Created At" : "Last Updated",
            () => column.toggleSorting(column.getIsSorted() === "asc"),
          )
        ),
        cell: ({ row }) => <div>{String(row.getValue(key))}</div>,
      }),
    ),
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const applicant = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href={`/apps/${applicant.app_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Applicant
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction(ApplicantStatus.ACCEPTED, applicant.app_id)}
              >
                Accept Applicant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction(ApplicantStatus.WAITLISTED, applicant.app_id)}
              >
                Waitlist Applicant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction(ApplicantStatus.REJECTED, applicant.app_id)}
              >
                Reject Applicant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
