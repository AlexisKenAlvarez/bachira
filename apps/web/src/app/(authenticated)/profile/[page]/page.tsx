import EditProfile from "@/components/user/EditProfile";
import { authOptions } from "@/server/auth";
import { api } from "@/trpc/server";
import { getServerSession } from "next-auth";
import React from "react";

const page = async ({ params }: { params: { page: string } }) => {

  const session = await getServerSession(authOptions);
  const userData = await api.user.getUser.query({
    username: session?.user.username as string,
  });

  const pages = [
    {
      slug: "edit",
      component: <EditProfile userData={userData!} />,
    },
  ];

  return (
    <>
      {pages.map(
        (items) =>
          items.slug === params.page && (
            <React.Fragment key={items.slug}>{items.component}</React.Fragment>
          ),
      )}
    </>
  );
};

export default page;
