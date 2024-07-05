import AddUsername from "@/components/auth/AddUsername";

import "@/styles/globals.css";

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Nav from "@/components/Nav";
import { createClient } from "@/supabase/supabaseServer";
import { api } from "@/trpc/server";
import TRPCProvider from "@/trpc/TRPCProvider";
import { Toaster } from "react-hot-toast";

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
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (user) {
    const isCreated = await api.user.isCreated({
      email: user.email!,
    });

    const countData = await api.notifications.countNotifications({
      userId: user.id,
      seen: false,
    });

    return (
      <TRPCProvider>
        <html lang="en">
          <body className={`${montserrat.variable} bg-bg font-sans`}>
            {!isCreated ? (
              <AddUsername session={user} />
            ) : (
              <div className="mx-auto flex min-h-screen w-full max-w-[780px] flex-col">
                <Nav
                  email={user.email!}
                  username={user.user_metadata.username as string}
                  image={user.user_metadata.avatar_url as string}
                  userId={user.id}
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
