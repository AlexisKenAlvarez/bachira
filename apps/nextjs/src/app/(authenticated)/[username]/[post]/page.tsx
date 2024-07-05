import { redirect } from "next/navigation";
import FeedPosts from "@/components/posts/FeedPosts";
import { createClient } from "@/supabase/supabaseServer";

const page = async ({ params }: { params: { post: number } }) => {
  const supabase = createClient();
  const {
    data: { session: sessionData },
  } = await supabase.auth.getSession();

  const session = sessionData?.user;

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
