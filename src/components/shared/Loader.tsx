"use client";

import { Loader } from "lucide-react";

const MyLoader = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-primary text-5xl font-bold">GChat</h1>
      <Loader className="animate-spin text-lg" />
    </div>
  );
};

export default MyLoader;
