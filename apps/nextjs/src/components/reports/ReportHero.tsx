"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { columns } from "@/components/reports/Columns";
import { DataTable } from "@/components/reports/Data-Table";
import PageButtons from "@/components/reports/PageButtons";
import { api } from "@/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

import { POST_REPORT_TYPE } from "@bachira/db/schema/schema";

const ReportHero = ({
  page,
  itemsPerPage,

  status,
  reason,
}: {
  page: number;
  itemsPerPage: number;

  status: "pending" | "resolved" | undefined;
  reason: (typeof POST_REPORT_TYPE)[number] | undefined;
}) => {
  const offset = (page - 1) * (itemsPerPage + 1);

  const { data, isPending } = api.posts.getReports.useQuery({
    offset,
    limit: itemsPerPage,
    status: status ? status.toUpperCase() : undefined,
    reason: reason,
  });

  const countReportQuery = api.posts.countReports.useQuery({
    status: status ? status.toUpperCase() : undefined,
    reason: reason,
  });

  const pages = Math.ceil(
    (countReportQuery.data?.[0]?.count as number) / itemsPerPage,
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handleSort(sortType: "status" | "reason", value: string) {
    console.log("🚀 ~ handleSort ~ value:", value);
    const params = new URLSearchParams(searchParams);

    params.set(sortType, value);
    if (value === "---") {
      params.delete(sortType);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

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
              <Tabs
                defaultValue={status ?? "pending"}
                onValueChange={(data: string) => handleSort("status", data)}
                className="w-full"
              >
                <TabsList className="flex w-full">
                  <TabsTrigger value="pending" className="w-full">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="w-full">
                    Resolved
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mb-5 flex flex-col gap-5 md:flex-row">

                <div className="">
                  <Select
                    defaultValue={reason ?? undefined}
                    onValueChange={(data) => handleSort("reason", data)}
                  >
                    <h1 className="font-medium">Reason: </h1>
                    <SelectTrigger className="w-[180px] border">
                      <SelectValue placeholder="---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="---">---</SelectItem>

                      {POST_REPORT_TYPE.map((type) => (
                        <SelectItem
                          value={type}
                          key={type}
                          className="capitalize"
                        >
                          {type.charAt(0) +
                            type.replace("_", " ").toLowerCase().slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
