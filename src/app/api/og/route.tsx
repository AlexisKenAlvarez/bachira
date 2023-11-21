import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(request: Request) {
  

  try {
    const { searchParams } = new URL(request.url);

    const hasusername = searchParams.has("username");
    const username = hasusername
      ? searchParams.get("title")?.slice(0, 100)
      : "Default username";

    return new ImageResponse(
      (
        <div tw="relative flex w-full h-full flex items-center justify-center bg-white text-white">
          {/* Background */}
          <div tw="absolute flex inset-0">
            <img
              tw="absolute top-0 w-full h-full"
              src={`${process.env.NEXT_PUBLIC_BASE_URL}cover.png`}
              alt="Bachira"
            />
          </div>
          <div tw="flex flex-col text-center items-center justify-center">
            {/* Title */}
            <h1 tw="text-9xl font-black">@{username}</h1>
            <p tw="text-2xl font-bold text-center">bachira.me/{username}</p>
          </div>
        </div>
      ),
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
