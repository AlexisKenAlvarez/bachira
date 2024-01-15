"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

const ImageSmooth = ({
  src,
  className,
}: {
  src: string;
  className?: string;
}) => {
  return (
    <Image
      alt="Auth Image"
      src={src}
      className={cn("", className)}
      onLoadingComplete={(image) => {
        image.classList.remove("opacity-0");
      }}
      width="1400"
      height="1400"
    />
  );
};

export default ImageSmooth;
