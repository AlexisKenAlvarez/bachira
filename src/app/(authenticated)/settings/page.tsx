"use client";

import { Button } from "@/components/ui/button";
import { ClerkLoaded, UserProfile } from "@clerk/nextjs";
import { ArrowBigLeftDash } from "lucide-react";
import { useRouter } from "next/navigation";

const Page = () => {
  
  const router = useRouter();

  return (
    <div className="absolute left-0 top-0 flex min-h-screen w-full flex-col items-center justify-center space-y-5 bg-white px-5 py-10 font-secondary">
      <ClerkLoaded>
        <>
          <div className="flex w-full max-w-[850px] items-center justify-between space-x-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => {
                router.back();
              }}
            >
              <ArrowBigLeftDash size={16} />
              Back
            </Button>

            <h1 className="">GChat Account Settings</h1>
          </div>
          <UserProfile path="/settings" routing="path" />
        </>
      </ClerkLoaded>
    </div>
  );
};

export default Page;
