import FeedPosts from "@/components/posts/FeedPosts";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { post: number } }) => {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="font-primary mt-4">
      <FeedPosts user={session.user} postId={+params.post} />
    </div>
  );
};

export default page;
