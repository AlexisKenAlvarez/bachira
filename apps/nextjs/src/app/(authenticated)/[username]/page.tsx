import { notFound, redirect } from "next/navigation";
import UserProfile from "@/components/user/UserProfile";
import { api } from "@/trpc/server";

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser({
    username: params.username,
  });
  const session = await api.user.getSession();

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
