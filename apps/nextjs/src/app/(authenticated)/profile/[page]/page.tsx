import EditProfile from "@/components/user/EditProfile";
import { api } from "@/trpc/server";
import React from "react";

const page = async ({ params }: { params: { page: string } }) => {

  const session = await api.user.getSession()
  const userData = await api.user.getUser({
    username: session?.user_metadata.username as string ?? "",
  });

  const pages = [
    {
      slug: "edit",
      component: <EditProfile userDataQueryServer={userData!} username={session?.user_metadata.username as string ?? ""} />,
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
