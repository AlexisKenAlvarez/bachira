import ReportHero from "@/components/reports/ReportHero";
import { redirect } from "next/navigation";


import type { POST_REPORT_TYPE } from "@bachira/db/schema/schema";
import { api } from "@/trpc/server";

const page = async ({
  searchParams,
}: {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const session = await api.user.getSession();
  if (session?.email !== "alexisken1432@gmail.com") {
    redirect("/");
  }

  const status = searchParams?.status as "pending" | "resolved" | undefined;
  const reason = searchParams?.reason as
    | (typeof POST_REPORT_TYPE)[number]
    | undefined;

  const page = searchParams?.page ? parseInt(searchParams?.page as string) : 1;
  const itemsPerPage = 7;

  return (
    <ReportHero
      page={page}
      itemsPerPage={itemsPerPage}
      status={status}
      reason={reason}
    />
  );
};

export default page;
