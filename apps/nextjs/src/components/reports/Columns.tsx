"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { RouterOutputs } from "@bachira/api";

import ActionsDropdown from "./ActionsDropdown";

type ReportType = RouterOutputs["posts"]["getReports"]["reportData"][0];

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
      const data = row.original;

      return data.user.username;
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

      return <ActionsDropdown post={post} />;
    },
  },
];
