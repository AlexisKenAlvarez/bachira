"use client";
import PostButtons from "@/components/posts/PostButtons";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Separator } from "../ui/separator";

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
              <div className="p-5 pb-3">
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

              <PostButtons
              likes={post.likes}
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
