import "@/styles/globals.css";

import AddUsername from "@/components/auth/AddUsername";
import TRPCProvider from "@/trpc/TRPCProvider";
import { authOptions } from "@bachira/auth";
import { getServerSession } from "next-auth";
import { Montserrat } from "next/font/google";

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Nav from "../components/Nav";
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
  const session = await getServerSession(authOptions);

  console.log(session?.user)
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
