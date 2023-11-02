"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { useUser } from "@clerk/nextjs";
import { Cog, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

const Nav = () => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <nav className="flex items-center justify-between border-b border-black/10 p-4">
      <div className="-mb-2 flex items-center gap-2">
        <Link href="/">
          <h1 className="font-primary text-5xl">GChat</h1>
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="">
          <Avatar className="">
            <AvatarImage src="/fox.webp" />
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
              <p className="max-w-full truncate overflow-ellipsis">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <Link href={`/${user?.username}`}>
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
          <SignOutButton
            signOutCallback={() => {
              router.push("/signin");
            }}
          >
            <DropdownMenuItem className="flex items-center gap-[4px]">
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Nav;
