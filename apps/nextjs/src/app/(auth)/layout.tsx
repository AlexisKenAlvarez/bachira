import { getServerAuthSession } from "@bachira/auth";
import { redirect } from "next/navigation";

export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (session) {
    redirect('/')
  }

  return <section>{children}</section>;
}
