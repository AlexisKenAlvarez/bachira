import UserProfile from "@/components/user/UserProfile";
import { authOptions } from "@/server/auth";
import { api } from "@/trpc/server";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser.query({ username: params.username });
  const session = await getServerSession(authOptions);

  if (!userData) {
    notFound();
  }

  const data = await api.user.checkFollowing.query({
    user_id: session?.user.id as string,
    following_id: userData[0]!.id,
  });

  const inProfile = session?.user.id === userData[0]!.id;

  return (
    <UserProfile
      userData={userData}
      inProfile={inProfile}
      isFollowing={data ? data?.isFollowing : false}
    />
  );
};

export default page;
