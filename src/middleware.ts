import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";
const redis = new Redis({
  url: 'UPSTASH_REDIS_REST_URL',
  token: 'UPSTASH_REDIS_REST_TOKEN',
})
// Create a new ratelimiter, that allows 5 requests per 5 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, "5 s"),
});

const forUnauthenticated = ["/signin", "/signin/reset-password", "/signup"];

export default authMiddleware({
  // "/" will be accessible to all users
  publicRoutes: ["/signin", "/signup", "/api/trpc/:path*"],
  afterAuth(auth, req) {
    
    // handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url }) as NextResponse;
    }

    // redirect them to organization selection page
    if (auth.userId && forUnauthenticated.includes(req.nextUrl.pathname)) {
      const signinPage = new URL("/", req.url);
      return NextResponse.redirect(signinPage);
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/api/trpc/:path*"],
};
