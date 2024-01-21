import { redirect } from "next/navigation";
import ReportHero from "@/components/reports/ReportHero";
import { api } from "@/trpc/server";
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

  const page = searchParams?.page ? parseInt(searchParams?.page as string) : 1;
  const itemsPerPage = 7;
  const countReportQuery = await api.posts.countReports.query();
  const pages = Math.ceil(countReportQuery[0]?.count as number / itemsPerPage);

  return <ReportHero page={page} pages={pages} itemsPerPage={itemsPerPage} />;
};

export default page;
