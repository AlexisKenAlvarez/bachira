import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const page = async ({searchParams}: {searchParams?: { [key: string]: string | string[] | undefined }}) => {
  const session = await getServerSession();

  if (!session || !session?.user) {
    redirect("/api/auth/signin");
  }

  console.log(searchParams?.feed);

  return (
    <div className="flex-1">
      <div className="font-primary flex w-full items-center justify-center">
        <button className="w-full text-center  py-3 hover:bg-slate-50">
          <h1 className="">World</h1>
        </button>
        <button className="w-full text-center py-3 hover:bg-slate-50">
          <h1 className="">For you</h1>
        </button>
      </div>
    </div>
  );
};

export default page;
