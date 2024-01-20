/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/require-await
export async function GET(request: Request) {
  try {
    cookies().set("next-auth.csrf-token", "", {
      expires: new Date(Date.now()),
    });
    cookies().set("next-auth.session-token", "", {
      expires: new Date(Date.now()),
    });
    cookies().set("next-auth.callback-url", "", {
      expires: new Date(Date.now()),
    });

    return Response.redirect(new URL("/", request.url));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
