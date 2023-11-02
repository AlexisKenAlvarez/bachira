"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";

const FollowData = ({
  type,
  value,
}: {
  type: "Following" | "Followers";
  value: number;
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <h2 className="group cursor-pointer font-medium">
          <span className="text-xl font-bold">{value}</span>{" "}
          <span className="underline-offset-2 group-hover:underline">
            {type}
          </span>
        </h2>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="space-y-3">
          <DialogTitle>{type}</DialogTitle>
          <Separator />
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default FollowData;
