"use server"

import FeedPosts from "@/components/posts/FeedPosts";
import Post from "@/components/posts/Post";
import { createClient } from "@/supabase/supabaseServer";

import { redirect } from "next/navigation";
// export const runtime = "edge"
// type SearchParams = Record<string, string | string[] | undefined>;

const page = async () => {
  const supabase = createClient()
  const {data: {session}} = await supabase.auth.getSession()

  const sessionData = session?.user

  if (!sessionData) {
    redirect("/signin");
  }

  return (
    <div className="flex-1">
      <div className="mt-4 w-full h-auto">
        <Post session={sessionData} /> 
        <div className="mt-4 min-h-screen w-full rounded-md font-primary pb-10">
          <FeedPosts user={sessionData}  />
        </div>
      </div>
    </div>
  );
};

export default page;
