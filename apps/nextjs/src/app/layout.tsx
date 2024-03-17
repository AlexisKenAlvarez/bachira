import AddUsername from "@/components/auth/AddUsername";

import "@/styles/globals.css";

import { supabaseServer } from "@/supabase/supabaseServer";
import TRPCProvider from "@/trpc/TRPCProvider";
import { api } from "@/trpc/server";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";

import Providers from "./providers";
import Nav from "@/components/Nav";

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
  // const data = await api.user.getSession()
  const supabase = supabaseServer();

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    const isCreated = await api.user.isCreated({
      email: data.session.user.email!,
    });

    console.log("🚀 ~ data:", data.session.user.user_metadata.username);

    const countData = await api.notifications.countNotifications({
      userId: data.session.user.id,
      seen: false,
    });
    console.log("🚀 ~ countData:", countData)

    return (
      <TRPCProvider>
        <html lang="en">
          <body className={`${montserrat.variable} bg-bg font-sans`}>
            {!isCreated ? (
              <AddUsername session={data.session} />
            ) : (
              <div className="mx-auto flex min-h-screen w-full max-w-[780px] flex-col">
                <Nav
                  email={data.session.user.email!}
                  username={data.session.user.user_metadata.username as string}
                  image={data.session.user.user_metadata.avatar_url as string}
                  userId={data.session.user.id}
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

  // if (session?.user.notFound) {
  //   redirect("/api/signout");
  // }

  //   return (
  //     <TRPCProvider>
  //       <html lang="en">
  //         <body className={`${montserrat.variable} bg-bg font-sans`}>
  //           {session ? (
  //             !session.user.username ? (
  //               <AddUsername email={session.user.email!} />
  //             ) : session.user.banned.status === true ? (
  //               <Banned banData={session.user.banned} />
  //             ) : (
  //               <div className="mx-auto flex min-h-screen w-full max-w-[780px] flex-col">
  //                 <Nav
  //                   email={session.user.email!}
  //                   username={session.user.username}
  //                   image={session.user.image!}
  //                   userId={session.user.id}
  //                   notifCount={countData ? (countData[0]?.count as number) : 0}
  //                 />

  //                 <Providers>
  //                   <div className="flex flex-1 flex-col">{children}</div>
  //                 </Providers>
  //               </div>
  //             )
  //           ) : (
  //             <Providers>{children}</Providers>
  //           )}
  //           <Toaster
  //             position="bottom-left"
  //             gutter={10}
  //             toastOptions={{
  //               duration: 5000,
  //             }}
  //           />
  //         </body>
  //       </html>
  //     </TRPCProvider>
  //   );
  // }
}
