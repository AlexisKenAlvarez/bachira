import { Separator } from "@/ui/separator";
import { getServerAuthSession } from "@bachira/auth";
import { redirect } from "next/navigation";

const page = async () => {

  const session = await getServerAuthSession()

  if (session?.user.email !== 'alexisken1432@gmail.com') {
    redirect("/")
  }

  return (
    <div className="flex flex-1 flex-col font-primary">
      <div className="mt-4 h-full w-full flex-1 rounded-md bg-white">
        <div className="my-5 text-center">
          <h2 className="font-semibold">Bachira</h2>
          <h1 className="text-2xl font-bold">Admin Control Panel</h1>
        </div>
        <Separator />
      </div>
    </div>
  );
};

export default page;
