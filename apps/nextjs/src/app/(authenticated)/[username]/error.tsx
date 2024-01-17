/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bird } from "lucide-react";

const Error = ({ error }: { error: Error & { digest?: string } }) => {
  const router = useRouter();

  useEffect(() => {
    console.log(error);
  }, []);

  return (
    <div className="grid h-[calc(100vh-73px)] w-full place-content-center text-center text-2xl px-5">
      <Bird className="text-center mx-auto text-5xl" size={170} strokeWidth={1}  />
      <p className="lg:text-2xl text-base">Sorry, there was an error.</p>
      <Button
        onClick={() => {
          router.push("/");
        }}
        className="mt-4 w-44 mx-auto"
      >
        Go Back
      </Button>
    </div>
  );
};

export default Error;
