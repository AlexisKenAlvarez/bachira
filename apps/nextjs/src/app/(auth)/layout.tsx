import { supabaseServer } from "@/supabase/supabaseServer";
import { redirect } from "next/navigation";

export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getSession();
  

  if (data.session) {
    redirect("/");
  }

  return <section>{children}</section>;
}
