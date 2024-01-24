import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import type { USER_REPORT_TYPE } from "@bachira/db/schema/schema";
import { db } from "@bachira/db";
import { users } from "@bachira/db/schema/schema";

export type { Session } from "next-auth";

export interface BanType {
  status: boolean;
  reason?: (typeof USER_REPORT_TYPE)[number];
  duration?: Date;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      countId: number;
      id: string;
      username: string;
      coverPhoto: string;
      image: string | null;
      notFound: boolean;
      banned: BanType;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    // role: UserRole;
    countId: number;
    username: string | null;
    coverPhoto: string | null;
    notFound: boolean;
    banned: BanType;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    signIn: async ({ user, account }) => {
      if (user) {
        const userFromDb = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, user.email!),
        });

        if (!userFromDb) {
          await db.insert(users).values({
            id: user.id,
            name: user.name,
            email: user.email!,
            image:
              account?.provider === "github" || account?.provider === "google"
                ? user.image
                : null,
          });
        } else {
          console.log("Count ID", userFromDb.countId);
          user.username = userFromDb.username;
          (user.countId = userFromDb.countId), (user.id = userFromDb.id);
          user.image = userFromDb.image;
          user.coverPhoto = userFromDb.coverPhoto;
        }
      }

      return true;
    },
    jwt: async ({ token, user, trigger, session }) => {
      const userFromDb = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, token.email!),
      });

      const bannedUser = await db.query.bans.findFirst({
        where: (bans, { eq }) => eq(bans.userId, token.id as string),
      });

      if (bannedUser) {

        const now = new Date();
        const banDate = new Date(bannedUser.duration)

        if (now > banDate) {
          token.banned = {
            status: false,
            reason: bannedUser.reason,
            duration: bannedUser.duration,
          };
        } else {
          token.banned = {
            status: true,
            reason: bannedUser.reason,
            duration: bannedUser.duration,
          };
        }
 
      } else {
        token.banned = {
          status: false,
          reason: undefined,
          duration: undefined,
        };
      }

      if (!userFromDb) {
        token.notFound = true;
      } else {
        token.notFound = false;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.countId = user.countId;
        token.username = user.username;
        token.coverPhoto = user.coverPhoto;
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        console.log("🚀 ~ file: auth.ts:80 ~ session:", session);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return { ...token, ...session.user };
      }

      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          countId: token.countId as string,
          id: token.id as string,
          username: token.username as string,
          coverPhoto: token.coverPhoto as string,
          image: token.image as string,
          notFound: token.notFound as boolean,
          banned: token.banned as BanType,
        },
      };
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // ...add more providers here
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
