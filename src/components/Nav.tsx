"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import { Bell, Cog, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

const Nav = ({
  email,
  username,
  image,
  userId,
}: {
  email: string;
  username: string;
  image: string;
  userId: string;
}) => {

  
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:incoming_follow`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:incoming_unfollow`));

    const followHandler = () => {
      alert("Followed");
    };

    const unfollowHandler = () => {
      alert("Followed");
    };

    pusherClient.bind("incoming_follow", followHandler);
    pusherClient.bind("incoming_unfollow", unfollowHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:incoming_follow`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:incoming_unfollow`));

      pusherClient.unbind("incoming_follow", followHandler);
      pusherClient.unbind("incoming_unfollow", unfollowHandler);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between border-b border-black/10 p-4 font-primary">
      <div className="-mb-2 flex items-center gap-2">
        <Link href="/">
          <h1 className="font-secondary text-4xl font-bold md:text-5xl">
            GChat
          </h1>
        </Link>
      </div>

      <div className="flex gap-2">
        <button>
          <div className="grid h-10 w-10 place-content-center rounded-full bg-black/5">
            <Bell size={18} strokeWidth={3} fill="black" />
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="">
            <Avatar className="">
              <AvatarImage src={image} />
              <AvatarFallback>
                <Skeleton className="h-full w-full rounded-full" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className=" relative w-[14rem] font-secondary"
          >
            <DropdownMenuLabel className="relative">
              <div className="">
                <h1 className="">My Account</h1>
                <p className="max-w-full truncate overflow-ellipsis">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/${username}`}>
              <DropdownMenuItem className="flex items-center gap-[4px]">
                <User size={16} fill="black" />
                Profile
              </DropdownMenuItem>
            </Link>

            <Link href="/settings">
              <DropdownMenuItem className="flex items-center gap-[4px]">
                <Cog size={16} />
                Manage Account
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-[4px]"
              onClick={() => {
                signOut({ callbackUrl: "/signin" });
              }}
            >
              <LogOut size={16} />
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Nav;
