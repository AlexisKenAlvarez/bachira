import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function authLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {

  return <section>{children}</section>;
}
