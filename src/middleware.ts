import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

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
