import { redirect } from "next/navigation";
import { createClient } from "@/supabase/supabaseServer";

export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    redirect("/");
  }

  return <section>{children}</section>;
}
