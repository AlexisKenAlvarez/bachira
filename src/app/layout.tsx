import "@/styles/globals.css";
import { cookies } from "next/headers";

import AddUsername from "@/components/auth/AddUsername";
import { authOptions } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { GeistSans } from "geist/font";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Montserrat } from "next/font/google";

import Nav from "../components/Nav";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";
import { api } from "@/trpc/server";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
export const metadata: Metadata = {
  title: "GChat",
  description: "Globally chat without worrying on language barriers.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);


  const countData =
    session &&
    (await api.notifications.countNotifications.query({
      userId: session.user.id,
      seen: false
    }));



  return (
    <TRPCReactProvider cookies={cookies().toString()}>
      <html lang="en">
        <body
          className={`${montserrat.variable} ${GeistSans.variable} font-sans`}
        >
          {session ? (
            !session.user.username ? (
              <AddUsername email={session.user.email!} />
            ) : (
              <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col border-x border-black/10">
                <Toaster
                  position="bottom-left"
                  gutter={10}
                  toastOptions={{
                    duration: 5000,
                  }}
                />
                <Nav
                  email={session.user.email!}
                  username={session.user.username}
                  image={session.user.image!}
                  userId={session.user.id}
                  notifCount={countData ? (countData[0]?.count as number) : 0}
                />
                <Providers>{children}</Providers>
              </div>
            )
          ) : (
            <Providers>{children}</Providers>
          )}
        </body>
      </html>
    </TRPCReactProvider>
  );
}
