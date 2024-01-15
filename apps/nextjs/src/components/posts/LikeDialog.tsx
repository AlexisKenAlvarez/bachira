"use client";

import { api } from "@/trpc/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ThumbsUp, X } from "lucide-react";

const LikeDialog = ({
  postId,
  likeLength,
  closeDialog,
}: {
  postId: number;
  likeLength: number;
  closeDialog: () => void;
}) => {
  const [ref, inView] = useInView();
  const { data, fetchNextPage } =
    api.posts.getLikes.useInfiniteQuery(
      {
        postId,
        limit: 7,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      },
    );

    useEffect(() => {
      void (async () => {
        if (inView === true) {
          await fetchNextPage();
        }
      })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-4 justify-between">
        <div className="flex w-20 items-center justify-center gap-2 border-b-4 border-primary py-3">
          <div className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-gradient-to-br from-primary/50 to-primary text-white">
            <ThumbsUp size="12" fill="white" className="" />
          </div>

          <h2 className="font-medium text-primary">{likeLength}</h2>
        </div>

        <button className="" onClick={closeDialog}>
          <X strokeWidth={2} size={25} className="text-subtle hover:text-black transtion-all ease-in-out duration-300" />
        </button>
      </div>
      <div className="content max-h-[20rem] space-y-4  pt-2 text-left">
        {data?.pages.map((page, i) => (
          <div className="space-y-4" key={i}>
            {page.likeData.map((user, j) => (
              <Link
                href={`/${user.user.username}`}
                key={user?.id}
                className="py-2"
              >
                <div
                  className="flex gap-3 rounded-md px-4 py-3 transition-all  duration-300 ease-in-out hover:bg-slate-100"
                  ref={
                    data?.pages.length - 1 === i &&
                    page.likeData.length - 1 === j
                      ? ref
                      : undefined
                  }
                >
                  <Image
                    src={user.user.image ?? ''}
                    alt={user.user.username ?? ''}
                    className="h-11 w-11 rounded-full object-cover"
                    width={500}
                    height={500}
                  />

                  <div className="flex flex-col justify-center">
                    <h1 className="max-w-[6rem] truncate font-primary font-bold md:max-w-[14rem]">
                      {user.user.username}
                    </h1>

                    <h2 className="max-w-[8rem] truncate font-primary text-sm md:max-w-[10rem]">
                      {user.user.name}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
        {/* {isFetching && (
          <div className="space-y-4">
            {[...new Array(4)].map((_, i) => (
              <UserSkeleton key={i} />
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default LikeDialog;
