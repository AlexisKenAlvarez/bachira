import { api } from "@/trpc/server";
import { redirect } from "next/navigation";


export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const data = await api.user.getSession()

  if (!data.session) {
    redirect('/signin')
  }

  return <section className="flex-1 flex flex-col">{children}</section>;
}
