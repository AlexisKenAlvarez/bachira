"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Cog, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Notifications from "./Notifications";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

const Nav = ({
  email,
  username,
  image,
  userId,
  notifCount,
}: {
  email: string;
  username: string;
  image: string;
  userId: string;
  notifCount: number;
}) => {
  return (
    <nav className="flex items-center justify-between border-b border-black/10 p-4 font-primary">
      <div className="-mb-2 flex items-center gap-2">
        <Link href="/">
          <h1 className="font-primary text-4xl font-bold md:text-5xl">
            GChat
          </h1>
        </Link>
      </div>

      <div className="flex gap-2">
        <Notifications userId={userId} notifCount={notifCount} />
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
            className=" relative w-[14rem] font-primary"
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
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Nav;
