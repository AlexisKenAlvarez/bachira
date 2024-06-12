"use server"

import FeedPosts from "@/components/posts/FeedPosts";
import Post from "@/components/posts/Post";
import { api } from "@/trpc/server";

import { redirect } from "next/navigation";
// export const runtime = "edge"
// type SearchParams = Record<string, string | string[] | undefined>;

const page = async () => {
  const session = await api.user.getSession()
  console.log("🚀 ~ page ~ session:", session)

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex-1">
      <div className="mt-4 w-full h-auto">
        <Post session={session} /> 
        <div className="mt-4 min-h-screen w-full rounded-md font-primary pb-10">
          <FeedPosts user={session}  />
        </div>
      </div>
    </div>
  );
};

export default page;
