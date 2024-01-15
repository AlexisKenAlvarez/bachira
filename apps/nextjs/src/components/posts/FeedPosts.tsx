/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import type { SessionUser } from "@/lib/userTypes";
import { api } from "@/trpc/client";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "../ui/skeleton";


import PostData from "./PostData";

const FeedPosts = ({
  user,
  postId,
}: {
  user: SessionUser;
  postId?: number;
}) => {
  const [ref, inView] = useInView();


  const followingQuery = api.user.postFollowing.useQuery({
    userId: user.id
  })

  const { data, fetchNextPage, isLoading, isError } =
    api.posts.getPosts.useInfiniteQuery(
      {
        limit: postId ? 1 : 10,
        postId,
        userId: user.id,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        retry: false
      },
    );

  if (isError) {
    notFound()
  }

  useEffect(() => {
    void (async () => {
      if (inView === true) {
        await fetchNextPage();
      }
    })()
  }, [inView]);

  return (
    <div className="h-full w-full space-y-4 px-3 lg:px-0">
      {data?.pages.map((page, i) =>
        page.postData.map((post, j) => {
          return (
            <div
              key={post.id}
              ref={
                data?.pages.length - 1 === i && page.postData.length - 1 === j
                  ? ref
                  : undefined
              }
            >
              <PostData user={user} post={post} singlePage={postId ? true : false} userFollowing={followingQuery.data?.userFollowing ?? []} />
            </div>
          );
        }),
      )}
      {isLoading &&
        [...Array(4)].map((_, i) => (
          <Skeleton className="h-44 w-full bg-slate-200" key={i} />
        ))}
    </div>
  );
};

export default FeedPosts;
