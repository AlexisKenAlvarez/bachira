import UserProfile from "@/components/user/UserProfile";

import { api } from "@/trpc/server";
import { getServerAuthSession } from "@bachira/auth";
import { notFound, redirect } from "next/navigation";

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser.query({ username: params.username });
  const session = await getServerAuthSession()

  if (!userData) {
    notFound();
  }

  if (!session || !session?.user) {
    redirect("/signin");
  }

  const data = await api.user.checkFollowing.query({
    user_id: session?.user.id,
    following_id: userData.id,
  });

  const inProfile = session?.user.id === userData.id;

  return (
    <UserProfile
      userData={userData}
      inProfile={inProfile}
      isFollowing={data ? data?.isFollowing : false}
    />
  );
};

export default page;
