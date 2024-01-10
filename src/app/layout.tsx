import "@/styles/globals.css";
import { cookies } from "next/headers";

import AddUsername from "@/components/auth/AddUsername";
import { authOptions } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { getServerSession } from "next-auth";
import { Montserrat } from "next/font/google";

import { api } from "@/trpc/server";
import { Toaster } from "react-hot-toast";
import Nav from "../components/Nav";
import Providers from "./providers";
import { Metadata } from "next";



const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Bachira",
  description: "Say more with Bachira",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log("IN LAYOUT WITH COUNTNOTIFICATIONS TEST PLS WORK")

  console.log(session?.user)

  const countData =
    session?.user.username &&
    (await api.notifications.countNotifications.query({
      userId: session.user.id,
      seen: false,
    }));

  return (
    <TRPCReactProvider cookies={cookies().toString()}>
      <html lang="en">
        <body className={`${montserrat.variable} bg-bg font-sans`}>
          {session ? (
            !session.user.username ? (
              <AddUsername email={session.user.email!} />
            ) : (
              <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col">
                <Nav
                  email={session.user.email!}
                  username={session.user.username}
                  image={session.user.image!}
                  userId={session.user.id}
                  notifCount={countData ? (countData[0]?.count as number) : 0}
                />

                <Providers>
                  <div className="flex flex-1 flex-col">{children}</div>
                </Providers>
              </div>
            )
          ) : (
            <Providers>{children}</Providers>
          )}
          <Toaster
            position="bottom-left"
            gutter={10}
            toastOptions={{
              duration: 5000,
            }}
          />
        </body>
      </html>
    </TRPCReactProvider>
  );
}
