"use client";
import Image from "next/image";

const ImageSmooth = ({ src }: { src: string }) => {
  return (
    <Image
      alt="Auth Image"
      src={src}
      className="h-full w-full object-cover opacity-0 transition-opacity duration-300"
      onLoadingComplete={(image) => {
        image.classList.remove("opacity-0");
      }}
      width="1400"
      height="1400"
    />
  );
};

export default ImageSmooth;
