"use client";

import type { Dispatch, SetStateAction, UIEvent } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notifications } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { User } from "lucide-react";

import UserSkeleton from "./skeleton/UserSkeleton";
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useInView } from "react-intersection-observer";

const NotificationData = ({
  userId,
  setOpen,
}: {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView();
  const { data, fetchNextPage, isFetching, refetch } =
    api.notifications.getNotifications.useInfiniteQuery(
      {
        limit: 10,
        userId,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        refetchOnMount: true,
      },
    );

  const read = api.notifications.readNotifications.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    const scrollPercentage =
      (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

    if (scrollPercentage > 75) {
      console.log("Fetching next page");
      await fetchNextPage();
    }
  };

  const toProfile = ["FOLLOW"];

  const toPost = [
    "LIKE_POST",
    "LIKE_COMMENT",
    "LIKE_REPLY",
    "MENTION_POST",
    "MENTION_COMMENT",
    "COMMENT",
  ];

  useEffect(() => {
    void (async () => {
      if (inView === true) {
        await fetchNextPage();
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <SheetContent
      className="overflow-y-scroll p-0 px-2 pb-5 text-left"
      onScroll={handleScroll}
      ref={sheetRef}
    >
      <SheetHeader>
        <SheetTitle className="m-5 text-left">Notifications</SheetTitle>
        <Separator />
        <div className="mt-2">
          {data?.pages.map((page, i) => (
            <div className="" key={i}>
              {page.notifications.map((notif, j) => (
                <Link
                  key={notif.id}
                  href={
                    toProfile.includes(notif.type)
                      ? `/${notif.notificationFrom.username}`
                      : toPost.includes(notif.type)
                        ? `${process.env.NEXT_PUBLIC_BASE_URL}${notif.notificationFor.username}/${notif.postId}`
                        : ""
                  }
                  ref={
                    data?.pages.length - 1 === i && page.notifications.length - 1 === j
                      ? ref
                      : undefined
                  }
                  onClick={async () => {
                    setOpen(false);
                    await read.mutateAsync({
                      notificationId: notif.id,
                    });
                  }}
                >
                  <div className="relative rounded-md px-5 py-3 text-left transition-all duration-300 ease-in-out hover:bg-gchat/5">
                    {notif.status === "UNREAD" && (
                      <div className="absolute bottom-0 right-4 top-0 my-auto h-2 w-2 rounded-full bg-primary"></div>
                    )}

                    <div className=" flex items-center gap-3">
                      <div className="relative h-fit w-fit rounded-full">
                        <div className="absolute bottom-[-4px] right-[-4px] h-fit w-fit rounded-full bg-primary p-[5px]">
                          <User fill="white" stroke="white" size={13} />
                        </div>
                        <Image
                          src={notif.notificationFrom?.image ?? "/fox.webp"}
                          alt={notif.notificationFrom?.username ?? "User Image"}
                          className="ml-0 h-12 w-12 shrink-0 rounded-full object-cover"
                          width={500}
                          height={500}
                        />
                      </div>

                      <div className="flex flex-col justify-center gap-0">
                        <h1 className=" inline-block max-w-20 truncate overflow-ellipsis font-primary font-bold md:max-w-[14rem]">
                          {notif.notificationFrom?.username}
                        </h1>
                        <p className="-mt-[5px]">
                          {notifications.map((value) =>
                            value.type === notif.type ? value.message : null,
                          )}
                        </p>
                        <p className="-mt-[2px] font-primary text-xs font-semibold text-primary">
                          {timeAgo(notif.createdAt.toString())}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {page.notifications.length === 0 && (
                <h1 className="text-center font-primary text-sm text-subtle">
                  You have no notifications.
                </h1>
              )}
            </div>
          ))}

          {isFetching &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [...new Array(4)].map((_, i) => (
              <div className="px-5 py-3" key={i}>
                <UserSkeleton imageSize="12" />
              </div>
            ))}
        </div>
      </SheetHeader>
    </SheetContent>
  );
};

export default NotificationData;
