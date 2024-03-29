import EditProfile from "@/components/user/EditProfile";
import { getServerAuthSession } from "@bachira/auth";
import { api } from "@/trpc/server";
import React from "react";

const page = async ({ params }: { params: { page: string } }) => {

  const session = await getServerAuthSession()
  const userData = await api.user.getUser.query({
    username: session?.user.username ?? "",
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
