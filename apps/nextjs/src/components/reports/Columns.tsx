"use client"

import type { ColumnDef } from "@tanstack/react-table";
import type { PostReport } from "@bachira/db/schema/schema";
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"

export const columns: ColumnDef<PostReport>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "reportType",
    header: "Reason",
  },
  {
    accessorKey: "userId",
    header: "Author ID",
  },
  {
    accessorKey: "postId",
    header: "Post ID",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      console.log(row.original);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];
