import "@/styles/globals.css";
import { cookies } from "next/headers";

import AddUsername from "@/components/auth/AddUsername";
import { authOptions } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { GeistSans } from "geist/font";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import Nav from "../components/Nav";

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
  console.log("🚀 ~ file: layout.tsx:31 ~ session:", session)

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
                <Nav />
                {children}
                <Toaster
                  toastOptions={{
                    duration: 5000,
                  }}
                />
              </div>
            )
          ) : (
            <>{children}</>
          )}
        </body>
      </html>
    </TRPCReactProvider>
  );
}
