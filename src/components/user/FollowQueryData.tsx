"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { api } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";
import { UIEvent } from "react";
import UserSkeleton from "../skeleton/UserSkeleton";
import { Separator } from "../ui/separator";

const FollowQueryData = ({
  type,
  userId,
}: {
  type: "Following" | "Followers";
  userId: string;
}) => {
  const { data, fetchNextPage, isFetching } =
    type === "Followers"
      ? api.user.getFollowers.useInfiniteQuery(
          {
            limit: 5,
            userId,
            type: "followers",
          },
          {
            getNextPageParam: (lastPage) => {
              return lastPage.nextCursor;
            },
          },
        )
      : api.user.getFollowers.useInfiniteQuery(
          {
            limit: 5,
            userId,
            type: "following",
          },
          {
            getNextPageParam: (lastPage) => {
              return lastPage.nextCursor;
            },
          },
        );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    const scrollPercentage =
      (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

    if (scrollPercentage > 75) {
      fetchNextPage();
    }
  };

  return (
    <DialogHeader className="space-y-3">
      <DialogTitle
        onClick={() => {
          fetchNextPage();
        }}
      >
        {type}
      </DialogTitle>
      <Separator />
      <div
        className="content max-h-[20rem] space-y-4 overflow-y-scroll pt-2 text-left"
        onScroll={handleScroll}
      >
        {data?.pages.map((page, i) => (
          <div className="space-y-4" key={i}>
            {page.followers.map((follower) => (
              <div className="flex gap-3" key={follower.id}>
                <Link
                  href={`/${
                    type === "Followers"
                      ? follower.follower.username
                      : follower.following.username
                  }`}
                >
                  <Image
                    src={
                      type === "Followers"
                        ? follower.follower.image!
                        : follower.following.image!
                    }
                    alt={follower.follower.name!}
                    className="w-14 rounded-full"
                    width={500}
                    height={500}
                  />
                </Link>

                <div className="flex flex-col justify-center">
                  <Link
                    href={`/${
                      type === "Followers"
                        ? follower.follower.username
                        : follower.following.username
                    }`}
                  >
                    <h1 className="max-w-[6rem] truncate font-primary font-bold md:max-w-[14rem]">
                      {type === "Followers"
                        ? follower.follower.username
                        : follower.following.username}
                    </h1>
                  </Link>
                  <h2 className="max-w-[8rem] truncate font-primary text-sm md:max-w-[10rem]">
                    {type === "Followers"
                      ? follower.follower.name
                      : follower.following.name}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        ))}
        {isFetching && (
          <div className="space-y-4">
            {[...new Array(4)].map((_, i) => (
              <UserSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </DialogHeader>
  );
};

export default FollowQueryData;
