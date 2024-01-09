import UserProfile from "@/components/user/UserProfile";
import { authOptions } from "@/server/auth";
import { api } from "@/trpc/server";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

// export function generateMetadata({ params }: Props) {
//   // read route params
//   const username = params.username;

//   return {
//     title: "Bachira",
//     description: "Say more with Bachira",
//     openGraph: {
//       title: "Bachira",
//       description: "Say more with Bachira",
//       images: [
//         {
//           url: `${process.env.NEXT_PUBLIC_BASE_URL}api/og?username=${username}`,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: "Bachira",
//       description: "Say more with Bachira",
//       images: [
//         {
//           url: `${process.env.NEXT_PUBLIC_BASE_URL}api/og?username=${username}`,
//         },
//       ],
//     },
//   };
// }

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
