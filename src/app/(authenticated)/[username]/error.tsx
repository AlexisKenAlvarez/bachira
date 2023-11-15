"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bird } from "lucide-react";

const Error = ({ error }: { error: Error & { digest?: string } }) => {
  const router = useRouter();

  useEffect(() => {
    console.log(error);
  }, []);

  return (
    <div className="grid h-[calc(100vh-73px)] w-full place-content-center text-center text-2xl">
      <Bird className="text-center mx-auto text-5xl" />
      <p className="">Sorry, there was an error</p>
      <Button
        onClick={() => {
          router.push("/");
        }}
        className="mt-4"
      >
        Go Back
      </Button>
    </div>
  );
};

export default Error;
