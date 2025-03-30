"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Row } from "@tanstack/react-table";

interface ExpenseTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function ExpenseTableRowActions<TData>({
  row,
}: ExpenseTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>View receipts</DropdownMenuItem>
        <DropdownMenuItem>Edit expense</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Delete expense
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
