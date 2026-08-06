import type { Dispatch, SetStateAction } from "react";
import type { Table as TableInstance } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Applicant } from "./types";

export function ApplicantTable({
  table,
  columnCount,
  offset,
  setOffset,
  pageSize,
  resultCount,
}: {
  table: TableInstance<Applicant>;
  columnCount: number;
  offset: number;
  setOffset: Dispatch<SetStateAction<number>>;
  pageSize: number;
  resultCount: number;
}) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border-1 border-black p-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={stickyActionsClass(header.id)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={stickyActionsClass(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
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
            onClick={() => setOffset((current) => Math.max(0, current - pageSize))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((current) => current + pageSize)}
            disabled={resultCount < pageSize}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

function stickyActionsClass(columnId: string) {
  return columnId === "actions"
    ? "sticky right-0 bg-background shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]"
    : "";
}
