import AddUsername from "@/components/auth/AddUsername";

import "@/styles/globals.css";

import TRPCProvider from "@/trpc/TRPCProvider";
import { api } from "@/trpc/server";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";

import Nav from "@/components/Nav";
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

  const session = await api.user.getSession()

  if (session) {
    const isCreated = await api.user.isCreated({
      email: session.email!,
    });

    const countData = await api.notifications.countNotifications({
      userId: session.id,
      seen: false,
    });

    return (
      <TRPCProvider>
        <html lang="en">
          <body className={`${montserrat.variable} bg-bg font-sans`}>
            {!isCreated ? (
              <AddUsername session={session} />
            ) : (
              <div className="mx-auto flex min-h-screen w-full max-w-[780px] flex-col">
                <Nav
                  email={session.email!}
                  username={session.user_metadata.username as string}
                  image={session.user_metadata.avatar_url as string}
                  userId={session.id}
                  notifCount={countData ?? 0}
                />

                <Providers>
                  <div className="flex flex-1 flex-col">{children}</div>
                </Providers>
              </div>
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
  } else {
    return (
      <TRPCProvider>
        <html lang="en">
          <body className={`${montserrat.variable} bg-bg font-sans`}>
            <Providers>{children}</Providers>

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
}
