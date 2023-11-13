'use client'
import { Separator } from "@radix-ui/react-dropdown-menu";
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useEffect } from "react";
import { api } from "@/trpc/react";

const NotificationData = ({userId}: {userId: string}) => {

  const { data, fetchNextPage } =
  api.notifications.getNotifications.useInfiniteQuery({
    limit: 10,
    userId,
  });

useEffect(() => {
  console.log(data?.pages);
}, []);

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Notifications</SheetTitle>
        <Separator />
      </SheetHeader>
    </SheetContent>
  );
};

export default NotificationData;
