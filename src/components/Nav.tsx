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

import { Cog, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { signOut } from "next-auth/react";

const Nav = ({ email, username, image }: { email: string; username: string, image: string }) => {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between border-b border-black/10 p-4 font-primary">
      <div className="-mb-2 flex items-center gap-2">
        <Link href="/">
          <h1 className="font-secondary text-5xl font-bold">GChat</h1>
        </Link>
      </div>

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
              <User size={16} />
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
    </nav>
  );
};

export default Nav;
