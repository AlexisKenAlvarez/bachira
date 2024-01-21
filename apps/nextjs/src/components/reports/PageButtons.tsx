"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/ui/button";

const PageButtons = ({ page, pages }: { page: number; pages: number }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handlePage(page: number) {
    const params = new URLSearchParams(searchParams);

    if (page) {
      params.set("page", page.toString());
    } else if (page <= 0) {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button variant="outline" size="sm" onClick={() => handlePage(page - 1)}
      disabled={page <= 1}
      >
        Previous
      </Button>
      <div className="flex items-center gap-x-2">
        <h3 className="">{page}</h3>
        <p className="">of</p>
        <h3 className="">{pages}</h3>
      </div>
      <Button variant="outline" size="sm" onClick={() => handlePage(page + 1)} 
      disabled={page >= pages}
      >
        Next
      </Button>
    </div>
  );
};

export default PageButtons;
