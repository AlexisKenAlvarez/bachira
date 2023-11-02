import "@/app/styles/globals.css";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Lalezar, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import type { Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import Nav from "../components/Nav";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: 'swap',
});

const lalezar = Lalezar({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lalezar",
});

export const metadata: Metadata = {
  title: "GChat",
  description: "Globally chat without worrying on language barriers.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <TRPCReactProvider headers={headers()}>
        <html lang="en">
          <body
            className={`${montserrat.variable} ${lalezar.variable} font-sans`}
          >
            <SignedIn>
              <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col border-x border-black/10">
                <Nav />

                {children}
              </div>
            </SignedIn>
            <SignedOut>{children}</SignedOut>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
