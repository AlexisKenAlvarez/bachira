
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: { username: string } }) => {
  // const userData = await api.user.getUser.query({ username: params.username });
  const data = await api.user.getSession()
  console.log(params);

  // if (!userData) {
  //   notFound();
  // }

  if (!data.session) {
    redirect("/signin");
  }

  // const data = await api.user.checkFollowing.query({
  //   user_id: session?.user.id,
  //   following_id: userData.id,
  // });

  // const inProfile = session?.user.id === userData.id;

  return (
    // <UserProfile
    //   userData={userData}
    //   inProfile={inProfile}
    //   isFollowing={data ? data?.isFollowing : false}
    // />
    <div className=""></div>
  );
};

export default page;
