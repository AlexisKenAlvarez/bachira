import { createClient } from "@/supabase/supabaseServer";
import { redirect } from "next/navigation";

export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/signin");
  }

  return <section className="flex flex-1 flex-col">{children}</section>;
}
