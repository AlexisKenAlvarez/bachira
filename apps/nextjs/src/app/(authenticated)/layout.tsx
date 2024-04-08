import { api } from "@/trpc/server";
import { redirect } from "next/navigation";


export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const session = await api.user.getSession()

  if (!session) {
    console.log("NO SESSIOJNDOIEANODINAWEOI");
    redirect('/signin')
  }

  return <section className="flex-1 flex flex-col">{children}</section>;
}
