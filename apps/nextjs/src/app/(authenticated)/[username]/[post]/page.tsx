import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { post: number } }) => {
  const data = await api.user.getSession()
  console.log(params);

  if (!data.session) {
    redirect("/auth/signin");
  }

  return (
    <div className="font-primary mt-4 pb-5">
      {/* <FeedPosts user={session.user} postId={+params.post} /> */}
    </div>
  );
};

export default page;
