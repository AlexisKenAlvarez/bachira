import { redirect } from "next/navigation";
import { columns } from "@/components/reports/Columns";
import { DataTable } from "@/components/reports/Data-Table";
import PageButtons from "@/components/reports/PageButtons";
import { api } from "@/trpc/server";
import { Separator } from "@/ui/separator";

import { getServerAuthSession } from "@bachira/auth";

const page = async ({
  searchParams,
}: {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const session = await getServerAuthSession();
  if (session?.user.email !== "alexisken1432@gmail.com") {
    redirect("/");
  }

  const itemsPerPage = 7;
  const page = searchParams?.page ? parseInt(searchParams?.page as string) : 1;
  const offset = (page - 1) * itemsPerPage + 1;

  const countReportQuery = await api.posts.countReports.query()
  const reportQuery = await api.posts.getReports.query({
    offset,
    limit: itemsPerPage,
  });

  const pages = Math.ceil(countReportQuery[0]?.count as number / itemsPerPage);

  return (
    <div className="flex flex-1 flex-col font-primary">
      <div className="mt-4 h-full w-full flex-1 rounded-md bg-white">
        <div className="my-5 text-center">
          <h2 className="font-semibold">Bachira</h2>
          <h1 className="text-2xl font-bold">Admin Control Panel</h1>
        </div>
        <Separator />

        <div className="p-5">
          <DataTable columns={columns} data={reportQuery.reportData} />
          <PageButtons page={page} pages={pages} />
        </div>
      </div>
    </div>
  );
};

export default page;
