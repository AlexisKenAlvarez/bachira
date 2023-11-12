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
import { api } from "@/trpc/react";

const FollowData = ({
  type,
  value,
  userId,
}: {
  type: "Following" | "Followers";
  value: number;
  userId: string;
}) => {
  const { data, fetchNextPage } = api.user.getFollowers.useInfiniteQuery(
    {
      limit: 4,
      userId,
    },
    {
      getNextPageParam: (lastPage, page) => {
        console.log("🚀 ~ file: FollowData.tsx:30 ~ page:", page);
        console.log("🚀 ~ file: FollowData.tsx:30 ~ lastPage:", lastPage);

        return lastPage.nextCursor;
      },
    },
  );

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
          <DialogTitle
            onClick={() => {
              fetchNextPage();
            }}
          >
            {type}
          </DialogTitle>
          <Separator />

          {data?.pages.map((page, i) => (
            <div className="" key={i}>
              {page.followers.map((follower) => (
                <div className="" key={follower.id}>
                  {follower.follower_id}
                </div>
              ))}
            </div>
          ))}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default FollowData;
