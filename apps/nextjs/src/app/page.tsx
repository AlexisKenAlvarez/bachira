// import FeedPosts from "@/components/posts/FeedPosts";
import Post from "@/components/posts/Post";
import { getServerAuthSession } from "@bachira/auth";
import { redirect } from "next/navigation";

// export const runtime = "edge"
// type SearchParams = Record<string, string | string[] | undefined>;

const page = async () => {
  const session = await getServerAuthSession()

  if (!session || !session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex-1">

      <div className="mt-4 w-full h-auto">
        <Post userData={session} />
        <div className="mt-4 min-h-screen w-full rounded-md font-primary pb-10">
          {/* <FeedPosts user={session.user}  /> */}
        </div>
      </div>
    </div>
  );
};

export default page;
