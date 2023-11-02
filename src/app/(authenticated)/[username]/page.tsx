import UserProfile from "@/components/user/UserProfile";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser.query({ username: params.username });
  const { userId }: { userId: string | null } = auth();

  if (!userData || !userId) {
    notFound();
  }

  const data = await api.user.checkFollowing.query({
    user_id: userId,
    following_id: userData[0]!.id,
  })

  const inProfile = userId === userData[0]!.id;

  return <UserProfile userData={userData} inProfile={inProfile} isFollowing={data ? data?.isFollowing : false} />;
};

export default page;
