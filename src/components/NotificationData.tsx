"use client";
import { api } from "@/trpc/react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

const NotificationData = ({
  userId,
  setOpen,
}: {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data, fetchNextPage } =
    api.notifications.getNotifications.useInfiniteQuery({
      limit: 10,
      userId,
    });

  useEffect(() => {
    console.log(data?.pages);
  }, []);

  return (
    <SheetContent className="overflow-y-scroll p-0 px-2 pb-5">
      <SheetHeader>
        <SheetTitle className="m-5">Notifications</SheetTitle>
        <Separator />
        <div className="mt-2">
          {data?.pages.map((page, i) => (
            <div className="" key={i}>
              {page.notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={
                    notif.type === "FOLLOW"
                      ? `/${notif.notificationFrom.username}`
                      : ""
                  }
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <div className="rounded-md px-5 py-3 transition-all duration-300 ease-in-out hover:bg-gchat/5">
                    <div className=" flex gap-3">
                      <div className="relative h-fit w-fit rounded-full">
                        <div className="w-fit h-fit absolute rounded-full bg-gchat bottom-[-4px] right-[-4px] p-[5px]">
                          <User fill="white" stroke="white" size={13} />
                        </div>
                        <Image
                          src={notif.notificationFrom.image ?? "/fox.webp"}
                          alt={notif.notificationFrom.username ?? "User Image"}
                          className="ml-0 w-12 shrink-0 rounded-full"
                        />
                      </div>

                      <div className="flex flex-col justify-center gap-0">
                        <h1 className=" max-w-20 inline-block truncate overflow-ellipsis font-primary font-bold md:max-w-[14rem]">
                          {notif.notificationFrom.username}
                        </h1>
                        <p className="-mt-[5px]">is now following you.</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </SheetHeader>
    </SheetContent>
  );
};

export default NotificationData;
