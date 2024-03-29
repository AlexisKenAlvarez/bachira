"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/ui/dialog";
import FollowQueryData from "./FollowQueryData";
import { cn } from "@/lib/utils";

const FollowData = ({
  type,
  value,
  userId,
}: {
  type: "Following" | "Followers";
  value: number;
  userId: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger
        className={cn("pointer-events-auto", {
          "pointer-events-none": value === 0,
        })}
      >
        <h2 className="group cursor-pointer font-medium">
          <span className="text-xl font-bold">{value}</span>{" "}
          <span className="underline-offset-2 group-hover:underline">
            {type}
          </span>
        </h2>
      </DialogTrigger>
      <DialogContent className="px-4">
        <FollowQueryData userId={userId} type={type} />
      </DialogContent>
    </Dialog>
  );
};

export default FollowData;
