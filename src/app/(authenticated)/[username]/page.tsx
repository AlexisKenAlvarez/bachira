import UserProfile from "@/components/user/UserProfile";
import { authOptions } from "@/server/auth";
import { api } from "@/trpc/server";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import og from "./opengraph-image";

export const metadata = {
  title: "Bachira",
  description: "Say more with Bachira",
  openGraph: {
    title: "Bachira",
    description: "Say more with Bachira",
    url: "https://cruip-tutorials-next.vercel.app/social-preview",
    images: [og],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bachira",
    description: "Say more with Bachira",
    images: [og],
  },
};

const page = async ({ params }: { params: { username: string } }) => {
  const userData = await api.user.getUser.query({ username: params.username });
  const session = await getServerSession(authOptions);

  if (!userData) {
    notFound();
  }

  if (!session || !session?.user) {
    redirect("/signin");
  }

  const data = await api.user.checkFollowing.query({
    user_id: session?.user.id,
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
