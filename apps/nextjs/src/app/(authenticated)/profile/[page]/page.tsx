import React from "react";
import EditProfile from "@/components/user/EditProfile";
import { createClient } from "@/supabase/supabaseServer";
import { api } from "@/trpc/server";

const page = async ({ params }: { params: { page: string } }) => {
  const supabase = createClient();
  const {
    data: { session: sessionData },
  } = await supabase.auth.getSession();

  const session = sessionData?.user;

  const userData = await api.user.getUser({
    username: (session?.user_metadata.username as string) ?? "",
  });

  const pages = [
    {
      slug: "edit",
      component: (
        <EditProfile
          userDataQueryServer={userData!}
          username={(session?.user_metadata.username as string) ?? ""}
        />
      ),
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
