import { not } from "drizzle-orm";
import { notFound } from "next/navigation";
import UserProfile from "@/components/UserProfile";
import { auth } from "@clerk/nextjs";
import { api } from "@/trpc/server";

interface filterVal {
  follower_id: string;
}

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser.query({ username: params.username });
  const { userId }: { userId: string | null } = auth();

  if (!userData) {
    notFound();
  }

  const inProfile = userId === userData[0]!.id;
  const isFollowing = userData[0]!.following.filter((val: filterVal) => val.follower_id === userId);

  return <UserProfile userData={userData} inProfile={inProfile} isFollowing={isFollowing.length > 0} />;
};

export default page;
