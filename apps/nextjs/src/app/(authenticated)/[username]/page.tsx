import { notFound, redirect } from "next/navigation";
import UserProfile from "@/components/user/UserProfile";
import { api } from "@/trpc/server";
import { createClient } from "@/supabase/supabaseServer";

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser({
    username: params.username,
  });

  const supabase = createClient();
  const {
    data: { session: sessionData },
  } = await supabase.auth.getSession();

  const session = sessionData?.user

  if (!userData) {
    notFound();
  }

  if (!session) {
    redirect("/signin");
  }

  const data = await api.user.checkFollowing({
    user_id: session.id,
    following_id: userData.id!,
  });

  const inProfile = session.id === userData.id;

  return (
    <UserProfile
      session={session}
      userData={userData}
      inProfile={inProfile}
      isFollowing={data ? data?.isFollowing : false}
    />
  );
};

export default page;
