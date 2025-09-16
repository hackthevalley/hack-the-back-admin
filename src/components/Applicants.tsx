"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
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
import AgeRangeSlider from "@/components/AgeRangeSlider";

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
  age?: string;
  gender?: string;
}

export function Applicants({
  applicants,
  setOffset,
  offset,
  search,
  setSearch,
  age,
  setAge,
  gender,
  setGender,
}: {
  applicants?: ApplicantProps[];
  setOffset: Dispatch<SetStateAction<number>>;
  offset: number;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  age: string;
  setAge: Dispatch<SetStateAction<string>>;
  gender: string;
  setGender: Dispatch<SetStateAction<string>>;
}) {
  const [data, setData] = useState(applicants ?? []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchInput, setSearchInput] = useState(search);
  const AGE_MIN = 13;
  const AGE_MAX = 40;
  const [ageRange, setAgeRange] = useState<[number, number]>([
    AGE_MIN,
    AGE_MAX,
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const genderOptions = [
    "Male",
    "Female",
    "Non-binary",
    "Other",
    "Prefer not to say",
  ];

  useEffect(() => {
    if (applicants) {
      applicants.forEach((applicant) => {
        applicant.created_at = convertToDateTime(applicant.created_at);
        applicant.updated_at = convertToDateTime(applicant.updated_at);
      });
      setData(applicants);
    }
  }, [applicants]);

  useEffect(() => {
    if (age && age.includes("-")) {
      const [min, max] = age.split("-").map(Number);
      setAgeRange([min, max]);
    } else if (!age) {
      setAgeRange([AGE_MIN, AGE_MAX]);
    }
  }, [age]);

  const handleAgeRangeChange = (newRange: [number, number]) => {
    setAgeRange(newRange);
    if (newRange[0] !== AGE_MIN || newRange[1] !== AGE_MAX) {
      const newAgeFilter = `${newRange[0]}-${newRange[1]}`;
      setAge(newAgeFilter);
    } else {
      setAge("");
    }
  };

  function convertToDateTime(input: string): string {
    const d = new Date(input);

    const parts = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Toronto",
      timeZoneName: "short",
    }).formatToParts(d);

    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";

    const month = get("month");
    const day = get("day");
    const year = get("year");
    const hour = get("hour");
    const minute = get("minute");
    const dayPeriod = get("dayPeriod");
    const tzName = get("timeZoneName");

    return `${month} ${day}, ${year} - ${hour}:${minute}${dayPeriod} ${tzName}`;
  }

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
          className="border-primary"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          className="border-primary"
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
      accessorKey: "age",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Age
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("age") || "N/A"}</div>,
    },
    {
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Gender
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("gender") || "N/A"}</div>
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
      cell: ({ row }) => <div className="">{row.getValue("created_at")}</div>,
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
      cell: ({ row }) => <div className="">{row.getValue("updated_at")}</div>,
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(searchInput);
            }
          }}
          className="max-w-md"
        />

        <div className="flex items-center py-4 space-x-2 mx-4">
          <Button
            variant="default"
            onClick={() => {
              setSearch(searchInput);
            }}
          >
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            {showAdvanced ? "Hide Advanced" : "Advanced Filters"}
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
      {showAdvanced && (
        <div className="flex items-center py-2 space-x-2">
          <AgeRangeSlider
            value={ageRange}
            onValueChange={handleAgeRangeChange}
            min={AGE_MIN}
            max={AGE_MAX}
            step={1}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-2 min-w-[150px] justify-between"
              >
                {gender || "All Genders"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
              <DropdownMenuItem onClick={() => setGender("")}>
                All Genders
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {genderOptions.map((opt) => (
                <DropdownMenuItem key={opt} onClick={() => setGender(opt)}>
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setAge("");
              setAgeRange([AGE_MIN, AGE_MAX]);
              setGender("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
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
            onClick={() =>
              setOffset((prev) => {
                const next = Math.max(0, prev - 25);
                return next;
              })
            }
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setOffset((prev) => {
                const next = prev + 25;
                return next;
              })
            }
            disabled={data.length < 25}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
