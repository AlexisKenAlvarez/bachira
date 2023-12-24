"use client";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";

const FeedPosts = () => {
  const { data, fetchNextPage, isFetching } =
    api.posts.getPosts.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      },
    );
  return (
    <div className="h-full w-full space-y-4">
      {data?.pages.map((page) =>
        page.postData.map((post) => {
          return (
            <div className="h-fit w-full rounded-md bg-white" key={post.id}>
              <div className=" p-5">
                <div className="flex gap-x-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={post.user.image as string}
                      width="500"
                      height="500"
                      alt={post.user.username as string}
                      className="absolute left-0 top-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="">
                    <h1 className="font-semibold">{post.user.username}</h1>
                    <p className="text-xs opacity-60">
                      {timeAgo(post.createdAt.toString())}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="">{post.text}</p>
                </div>
              </div>
              <Separator />
              <div className="w-full text-sm flex p-1">
                <button className="flex items-center gap-x-1 w-full justify-center hover:bg-slate-100 py-2 rounded-md">
                  <ThumbsUp size="16" />
                  <p className="">Like</p>
                </button>
                <button className="flex items-center gap-x-1 w-full justify-center hover:bg-slate-100 py-2 rounded-md">
                  <MessageCircle size="16" />
                  <p className="">Comment</p>
                </button>
                <button className="flex items-center gap-x-1 w-full justify-center hover:bg-slate-100 py-2 rounded-md">
                  <Share2 size="16" />
                  <p className="">Share</p>
                </button>
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
};

export default FeedPosts;
