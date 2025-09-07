"use client";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import fetchInstance from "@/utils/api";
import { toast } from "sonner";

enum Status {
  ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE",
  NOT_APPLIED = "NOT_APPLIED",
  APPLYING = "APPLYING",
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  WAITLISTED = "WAITLISTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  ACCEPTED_INVITE = "ACCEPTED_INVITE",
  REJECTED_INVITE = "REJECTED_INVITE",
  SCANNED_IN = "SCANNED_IN",
}

export interface ApplicantProps {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  app_id: string;
  created_at: string;
  updated_at: string;
}

export function Applicants({
  applicants,
  setOffset,
  offset,
  search,
  setSearch,
}: {
  applicants?: ApplicantProps[];
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  offset: number;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [data, setData] = React.useState(applicants ?? []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchInput, setSearchInput] = React.useState(search);

  React.useEffect(() => {
    if (applicants) {
      setData(applicants);
    }
  }, [applicants]);

  const updateApplicationStatus = (id: string, newStatus: Status) => {
    setData((previousData) =>
      previousData.map((applicant) =>
        applicant.app_id === id
          ? {
              ...applicant,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : applicant
      )
    );
  };

  const showToast = (action: Status, msg?: string) => {
    switch (action) {
      case Status.ACCEPTED:
        toast.success(`${msg} Applicant(s) accepted`, {
          icon: <CheckCircle className="text-green-500" />,
        });
        break;
      case Status.WAITLISTED:
        toast(`${msg} Applicant(s) waitlisted`, {
          icon: <AlertTriangle className="text-yellow-500" />,
        });
        break;
      case Status.REJECTED:
        toast.error(`${msg} Applicant(s) rejected`, {
          icon: <XCircle className="text-red-500" />,
        });
        break;
      default:
        toast("Status updated");
    }
  };

  const handleApplicantAction = async (action: Status, app_id: string) => {
    try {
      const res = await fetchInstance(
        `admin/account/updatestatus/${app_id}?request=${action}`,
        { method: "PUT" }
      );

      if (res.application_id == app_id) {
        updateApplicationStatus(app_id, action);
        showToast(action);
      } else {
        toast.warning("Action Failed...");
      }
    } catch {
      toast.error(
        "An error occurred while trying update status of applicant..."
      );
    }
  };

  const columns: ColumnDef<ApplicantProps>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("first_name")}</div>,
    },
    {
      accessorKey: "last_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("last_name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("created_at")}</div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Updated
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("updated_at")}</div>
      ),
    },
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
              <DropdownMenuItem>View Applicant</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleApplicantAction(Status.ACCEPTED, applicant.app_id)
                }
              >
                Accept Applicant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleApplicantAction(Status.WAITLISTED, applicant.app_id)
                }
              >
                Waitlist Applicant
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleApplicantAction(Status.REJECTED, applicant.app_id)
                }
              >
                Reject Applicant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleBulkAction = async (action: Status) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    try {
      await Promise.all(
        selectedRows.map((applicant) =>
          fetchInstance(
            `admin/account/updatestatus/${applicant.app_id}?request=${action}`,
            { method: "PUT" }
          ).then((res) => {
            if (res.application_id === applicant.app_id) {
              updateApplicationStatus(applicant.app_id, action);
            }
          })
        )
      );
      showToast(action, `${selectedRows.length}`);
      setRowSelection({});
    } catch {
      toast.error("An error occurred while performing bulk action");
    }
  };

  return (
    <div className="w-full py-4 px-6">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center py-4 space-x-2 mx-4">
          <Button variant="default" onClick={() => setSearch(searchInput)}>
            Search
          </Button>
          <Button
            variant="success"
            disabled={Object.keys(rowSelection).length === 0}
            onClick={() => handleBulkAction(Status.ACCEPTED)}
          >
            Accept Selected
          </Button>
          <Button
            variant="destructive"
            disabled={Object.keys(rowSelection).length === 0}
            onClick={() => handleBulkAction(Status.REJECTED)}
          >
            Reject Selected
          </Button>
          <Button
            variant="default"
            disabled={Object.keys(rowSelection).length === 0}
            onClick={() => handleBulkAction(Status.WAITLISTED)}
          >
            Waitlist Selected
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border-1 border-black p-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((prev) => Math.max(0, prev - 25))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((prev) => prev + 25)}
            disabled={data.length < 25}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
