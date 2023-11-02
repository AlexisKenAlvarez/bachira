import { not } from "drizzle-orm";
import { notFound } from "next/navigation";
import UserProfile from "@/components/user/UserProfile";
import { auth } from "@clerk/nextjs";
import { api } from "@/trpc/server";

interface filterVal {
  follower_id: string;
}

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser.query({ username: params.username });
  const { userId }: { userId: string | null } = auth();



  if (!userData || !userId) {
    notFound();
  }

  const isFollowing = await api.user.checkFollowing.query({
    user_id: userId as string,
    following_id: userData[0]!.id as string,
  })

  const inProfile = userId === userData[0]!.id;


  return <UserProfile userData={userData} inProfile={inProfile} isFollowing={isFollowing ? true : false} />;
};

export default page;
