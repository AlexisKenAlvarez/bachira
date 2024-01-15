// import FeedPosts from "@/components/posts/FeedPosts";
import { authOptions } from "@bachira/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="font-primary mt-4 pb-5">
      {/* <FeedPosts user={session.user} postId={+params.post} /> */}
    </div>
  );
};

export default page;
