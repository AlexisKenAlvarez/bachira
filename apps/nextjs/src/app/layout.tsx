import "@/styles/globals.css";

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import AddUsername from "@/components/auth/AddUsername";
import { api } from "@/trpc/server";
import TRPCProvider from "@/trpc/TRPCProvider";
import { Toaster } from "react-hot-toast";

import { getServerAuthSession } from "@bachira/auth";

import Nav from "../components/Nav";
import { DeleteSession } from "./actions";
import Providers from "./providers";

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
  const session = await getServerAuthSession();
  console.log("🚀 ~ session:", session);

  if (session?.user.notFound) {
    await DeleteSession();
  }

  const countData =
    session &&
    (await api.notifications.countNotifications.query({
      userId: session.user.id,
      seen: false,
    }));

  return (
    <TRPCProvider>
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
    </TRPCProvider>
  );
}
