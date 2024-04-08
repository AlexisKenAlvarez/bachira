import { redirect } from "next/navigation";
import FeedPosts from "@/components/posts/FeedPosts";
import { api } from "@/trpc/server";

const page = async ({ params }: { params: { post: number } }) => {
  const session = await api.user.getSession();
  console.log(params);

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="mt-4 pb-5 font-primary">
      <FeedPosts user={session} postId={+params.post} />
    </div>
  );
};

export default page;
