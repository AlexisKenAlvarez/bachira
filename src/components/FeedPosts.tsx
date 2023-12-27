"use client";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import PostButtons from "./PostButtons";
import { useSession } from "next-auth/react";
import { authOptions } from "@/server/auth";

const FeedPosts = ({ userId }: { userId: string }) => {
  const [ref, inView] = useInView();

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

  useEffect(() => {
    if (inView === true) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="h-full w-full space-y-4">
      {data?.pages.map((page, i) =>
        page.postData.map((post, j) => {
          return (
            <div
              className="h-fit w-full rounded-md bg-white"
              key={post.id}
              ref={
                data?.pages.length - 1 === i && page.postData.length - 1 === j
                  ? ref
                  : undefined
              }
            >
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
              <PostButtons
              postId={post.id}
              userId={userId}
                postLiked={
                  post.likes.some((obj) => obj.userId === userId) ? true : false
                }
              />
            </div>
          );
        }),
      )}
    </div>
  );
};

export default FeedPosts;
