"use client";

import { columns } from "@/components/reports/Columns";
import { DataTable } from "@/components/reports/Data-Table";
import PageButtons from "@/components/reports/PageButtons";
import { api } from "@/trpc/client";
import { Separator } from "@/ui/separator";

const ReportHero = ({
  page,
  itemsPerPage,
  pages,
}: {
  page: number;
  itemsPerPage: number;
  pages: number;
}) => {
  const offset = (page - 1) * (itemsPerPage + 1);

  const { data, isPending } = api.posts.getReports.useQuery({
    offset,
    limit: itemsPerPage,
  });

  return (
    <div className="flex flex-1 flex-col font-primary">
      <div className="mt-4 h-full w-full flex-1 rounded-md bg-white">
        <div className="my-5 text-center">
          <h2 className="font-semibold">Bachira</h2>
          <h1 className="text-2xl font-bold">Admin Control Panel</h1>
        </div>
        <Separator />

        <div className="p-5">
          {isPending ? (
            <h1 className="text-center">Fetching data...</h1>
          ) : (
            <>
              <DataTable columns={columns} data={data?.reportData ?? []} />
              <PageButtons page={page} pages={pages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportHero;
