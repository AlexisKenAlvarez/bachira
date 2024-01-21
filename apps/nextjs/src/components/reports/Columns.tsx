"use client";

import { api } from "@/trpc/client";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@bachira/api";
type ReportType = RouterOutputs["posts"]["getReports"]["reportData"][0]



export const columns: ColumnDef<ReportType>[] = [
  {
    accessorKey: "postId",
    header: "Post_ID",
  },
  {
    accessorKey: "reportType",
    header: "Reason",
  },
  {
    header: "Author",
    cell: ({ row }) => {
      const data  = row.original;

      return data.user.username
    },
  },
  {
    accessorKey: "post.text",
    header: "Content",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const post = row.original;

      const utils = api.useUtils();
      const deletePost = api.posts.deletePost.useMutation({
        onSuccess: async () => {
          toast.success("Post deleted successfully");
          await utils.posts.getReports.invalidate();
        },
      });
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
            <DropdownMenuItem
              onClick={() =>
                deletePost.mutate({
                  postId: post.postId,
                  fromReport: true,
                })
              }
            >
              Delete post
            </DropdownMenuItem>
            <DropdownMenuItem>Ban user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
