
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";

export function GET() {
  console.log(getCookie("next-auth.session-token", { cookies }));


  console.log("Cookies deleted!!!");
  return Response.json({ message: "Hello from Next.js!" });
}
