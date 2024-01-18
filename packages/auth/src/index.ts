// import type { DefaultSession } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import GithubProvider from "next-auth/providers/github";

// import { db } from "@bachira/db";
// import { users } from "@bachira/db/schema/schema";

// import { getServerSession } from "next-auth";
// import type { NextAuthOptions } from "next-auth";
// export type { Session } from "next-auth";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       countId: number;
//       id: string;
//       username: string;
//       coverPhoto: string;
//       image: string | null;
//       // ...other properties
//       // role: UserRole;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     // ...other properties
//     // role: UserRole;
//     countId: number
//     username: string | null;
//     coverPhoto: string | null;
//   }
// }


// /**
//  * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
//  *
//  * @see https://next-auth.js.org/configuration/options
//  */
// export const authOptions: NextAuthOptions = {
//   callbacks: {
//     signIn: async ({ user, account }) => {
//       if (user) {
//         const userFromDb = await db.query.users.findFirst({
//           where: (users, { eq }) => eq(users.email, user.email!),
//         });

//         if (!userFromDb) {
//           await db.insert(users).values({
//             id: user.id,
//             name: user.name,
//             email: user.email!,
//             image:
//               account?.provider === "github" || account?.provider === "google"
//                 ? user.image
//                 : null,
//           });
//         } else {
//           console.log("Count ID", userFromDb.countId);
//           user.username = userFromDb.username;
//           user.countId = userFromDb.countId,
//           user.id = userFromDb.id;
//           user.image = userFromDb.image;
//           user.coverPhoto = userFromDb.coverPhoto;
//         }
//       }

//       return true;
//     },
//     jwt: ({ token, user, trigger, session }) => {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.countId = user.countId
//         token.username = user.username;
//         token.coverPhoto = user.coverPhoto;
//         token.image = user.image;
//       }

//       if (trigger === "update" && session) {
//         console.log("🚀 ~ file: auth.ts:80 ~ session:", session);

//         // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
//         return { ...token, ...session.user };
//       }

//       return token;
//     },
//     session: ({ session, token }) => {
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           countId: token.countId as string,
//           id: token.id as string,
//           username: token.username as string,
//           coverPhoto: token.coverPhoto as string,
//           image: token.image as string
//         },
//       };
//     },
//   },

//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     GithubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID!,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//     }),
//     // ...add more providers here
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/signin",
//   },
// };

// /**
//  * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
//  *
//  * @see https://next-auth.js.org/configuration/nextjs
//  */
// export const getServerAuthSession = () => getServerSession(authOptions);

import NextAuth from "next-auth"
import authConfig from './auth.config'


export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  ...authConfig

})