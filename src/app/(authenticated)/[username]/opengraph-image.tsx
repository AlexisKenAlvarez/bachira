import { ImageResponse } from "next/og";
export const size = {
  width: 1200,
  height: 500,
};
export const alt = "Bachira";
export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    {
      contentType: 'image/png',
      size: { width: 1200, height: 500 },
      alt: "Bachira"
    },
  ]
}

export default function og({ params }: { params: { username: string } }) {
  const username = params.username;

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
    size,
  );
}
