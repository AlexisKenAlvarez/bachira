"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { notifications } from "@/lib/constants";
import { pusherClient } from "@/lib/pusher";
import { api } from "@/trpc/client";
import { Sheet, SheetTrigger } from "@/ui/sheet";
import { Bell, X } from "lucide-react";
import toast from "react-hot-toast";

import { toPusherKey } from "@bachira/api/lib/pusher";

import NotificationData from "./NotificationData";

interface NotificationType {
  image: string;
  notificationFrom: string;
  type: string;
  postId?: number;
}

const Notifications = ({
  userId,
  notifCount,
}: {
  userId: string;
  notifCount: number;
}) => {
  const [count, setCount] = useState<number>(Number(notifCount));

  const [recentNotif, setRecentNotif] = useState<NotificationType[]>([]);
  const [open, setOpen] = useState(false);
  const seen = api.notifications.seenNotifications.useMutation();
  const utils = api.useUtils();

  const notificationHandler = async (data: NotificationType) => {
    const alreadyNotified = recentNotif.some((el) => {
      console.log(el.type);

      if (el.type === "LIKE_POST") {
        return (
          el.notificationFrom === data.notificationFrom &&
          el.type === data.type &&
          el.postId === data.postId
        );
      } else {
        return (
          el.notificationFrom === data.notificationFrom && el.type === data.type
        );
      }
    });

    if (alreadyNotified) {
      console.log("Not sending notification, already notified");
    } else {
      setRecentNotif((prev) => [...prev, data]);
      await utils.notifications.getNotifications.invalidate();

      toast.dismiss("follow_toast");
      toast((t) => (
        <div className=" flex gap-3">
          <button
            className="absolute -right-[3px] -top-[3px] rounded-full border border-black/50 p-[2px] opacity-60"
            onClick={() => {
              console.log("Toast closed");
              toast.dismiss(t.id);
            }}
          >
            <X size={10} />
          </button>
          <Image
            src={data.image}
            alt="Follower Image"
            className="ml-0 h-12 w-12 shrink-0 rounded-full object-cover"
            width={500}
            height={500}
          />

          <div className="flex flex-col justify-center gap-0">
            <h1 className=" inline-block max-w-20 truncate overflow-ellipsis font-primary font-bold md:max-w-[14rem]">
              {data.notificationFrom}
            </h1>
            <p className="-mt-[5px]">
              {notifications.map((notif) =>
                notif.type === data.type ? notif.message : null,
              )}
            </p>
          </div>
        </div>
      ));
      setCount((prev) => (prev += 1));
    }
  };

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:incoming_notification`));
    pusherClient.bind("incoming_notification", notificationHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${userId}:incoming_notification`),
      );
      pusherClient.unbind("incoming_notification", notificationHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentNotif]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        onClick={async () => {
          setRecentNotif([]);
          setCount(0);

          await seen.mutateAsync({ userId: userId });
        }}
      >
        <div className="relative grid h-10 w-10 place-content-center rounded-full bg-black/5">
          {count > 0 && (
            <div className="absolute -right-[4px] -top-[4px] h-fit w-fit rounded-full bg-primary p-[9px] font-primary text-[10px] text-white">
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
