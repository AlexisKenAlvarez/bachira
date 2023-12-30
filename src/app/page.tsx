import FeedPosts from "@/components/posts/FeedPosts";
import Post from "@/components/user/Post";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;



const page = async ({ searchParams }: { searchParams?: SearchParams }) => {
  const session = await getServerSession(authOptions);
  console.log("🚀 ~ file: page.tsx:11 ~ session:", session);

  if (!session || !session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex-1">
      {/* <div className="flex w-full items-center justify-center font-primary">
        <button className="w-full py-3  text-center hover:bg-slate-50 gap-1 flex items-center justify-center">
          <Globe2 strokeWidth={1.4} size={16} />
          
          <h1 className="">World</h1>
        </button>
        <button className="w-full py-3 text-center hover:bg-slate-50">
          <h1 className="">For you</h1>
        </button>
      </div> */}

      <div className="mt-4 w-full">
        <Post userData={session} />
        <div className="mt-4 min-h-screen w-full rounded-md font-primary">
          <FeedPosts user={session.user} />
        </div>
      </div>
    </div>
  );
};

export default page;
