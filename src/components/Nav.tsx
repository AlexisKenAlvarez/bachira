"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AnimatePresence } from "framer-motion";
import { Cog, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import Notifications from "./Notifications";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import SearchUser from "./user/SearchUser";
import { debounce } from "lodash";

const Nav = ({
  email,  username,
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
  const [open, setOpen] = useState(false);
  const [searchValue, setValue] = useState("");

  const search = debounce((value: string) => {
    setValue(value);
    if (value === "") {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, 700);

  const debounceSearch = useCallback((value: string) => {
    search(value);
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(event.target.value);
  };

  const closeSearch = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <nav className="z-50 flex items-center justify-between gap-3 p-4 font-primary sticky top-0 bg-white rounded-md">
      <div className="relative flex items-center gap-2">
        <Link href="/">
          <Image
            src="/logo.png"
            width={500}
            height={500}
            alt="Logo"
            className="w-10"
          />
        </Link>
        <div className="relative h-fit w-fit">
          <Input
            id="search"
            name="search"
            placeholder="Search users..."
            className="focus-visible:ring-transparent"
            autoComplete="off"
            onBlur={() =>
              setTimeout(() => {
                closeSearch();
              }, 100)
            }
            onFocus={() => {
              if (searchValue !== "") {
                setOpen(true);
              }
            }}
            onChange={handleSearch}
          />
          <AnimatePresence>
            {open && <SearchUser searchValue={searchValue} />}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-2">
        <Notifications userId={userId} notifCount={notifCount} />
        <DropdownMenu>
          <DropdownMenuTrigger className="">
            <Avatar className="">
              <AvatarImage src={image} className="object-cover" />
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
                <User size={16} fill="primary" />
                Profile
              </DropdownMenuItem>
            </Link>

            <Link href="/profile/edit">
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
