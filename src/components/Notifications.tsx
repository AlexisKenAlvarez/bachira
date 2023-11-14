"use client";

import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationData from "./NotificationData";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/trpc/react";
import Image from "next/image";

interface NotificationType {
  image: string;
  notificationFrom: string;
  type: string;
}

const Notifications = ({
  userId,
  notifCount,
}: {
  userId: string;
  notifCount: number;
}) => {
  const read = api.notifications.readNotifications.useMutation()
  const [count, setCount] = useState<number>(Number(notifCount));
  const [recentNotif, setRecentNotif] = useState<NotificationType[]>([]);
  const [open, setOpen] = useState(false)

  const followHandler = (data: NotificationType) => {
    const alreadyNotified = recentNotif.some(
      (el) => el.notificationFrom === data.notificationFrom,
    );

    if (alreadyNotified) {
      console.log("Not sending notification, already notified");
    } else {
      setRecentNotif((prev) => [...prev, data]);

      toast.dismiss("follow_toast");
      toast(
        <div className=" flex gap-3">
          <button className="absolute -right-[3px] -top-[3px] rounded-full border border-black/50 p-[2px] opacity-60">
            <X size={10} />
          </button>
          <Image
            src={data.image}
            alt="Follower Image"
            className="ml-0 w-12 shrink-0 rounded-full"
          />

          <div className="flex flex-col justify-center gap-0">
            <h1 className=" max-w-20 inline-block truncate overflow-ellipsis font-primary font-bold md:max-w-[14rem]">
              {data.notificationFrom}
            </h1>
            <p className="-mt-[5px]">is now following you.</p>
          </div>
        </div>,
      );
      setCount((prev) => (prev += 1));
    }
  };

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:incoming_follow`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:incoming_unfollow`));

    pusherClient.bind("incoming_follow", followHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:incoming_follow`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:incoming_unfollow`));

      pusherClient.unbind("incoming_follow", followHandler);
    };
  }, [recentNotif]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        onClick={async () => {
          setRecentNotif([]);
          setCount(0);
          await read.mutateAsync({ userId, type: "FOLLOW" })
        }}
      >
        <div className="relative grid h-10 w-10 place-content-center rounded-full bg-black/5">
          {count > 0 && (
            <div className="absolute -right-[4px] -top-[4px] h-fit w-fit rounded-full bg-red-500 p-[9px] font-secondary text-[10px] text-white">
              <p className="absolute bottom-0 left-0 right-0 top-0 m-auto h-fit font-semibold">
                {count}
              </p>
            </div>
          )}
          <Bell size={18} strokeWidth={3} fill="black" />
        </div>
      </SheetTrigger>
      <NotificationData userId={userId} setOpen={setOpen} />
    </Sheet>
  );
};

export default Notifications;
