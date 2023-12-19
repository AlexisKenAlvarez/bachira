"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Form, FormControl, FormField } from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ChevronDown, Globe2, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const Post = ({ userData }: { userData: Session }) => {
  const PRIVACY = ["Public", "Private"] as const;

  const postObject = z.object({
    text: z
      .string()
      .min(1)
      .max(500, { message: "Maximum characters allowed reached." }),
    privacy: z.enum(PRIVACY),
  });

  type postType = z.infer<typeof postObject>;

  const postForm = useForm<postType>({
    resolver: zodResolver(postObject),
    defaultValues: {
      text: "",
      privacy: "Public",
    },
  });

  return (
    <section className="w-full rounded-md bg-white p-5">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={userData.user.image as string}
            className="object-cover"
          />
          <AvatarFallback>
            <Skeleton className="h-full w-full rounded-full" />
          </AvatarFallback>
        </Avatar>
        <Dialog>
          <DialogTrigger className="w-full">
            <input
              type="text"
              placeholder="What's on your mind?"
              className="w-full cursor-text select-none rounded-lg border-none bg-bg px-4 py-3 font-primary outline-none"
            />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogDescription>
                <div className="space-y-4">
                  <div className="text-2xl text-black font-semibold flex justify-between">
                    <h1 className="">Create a post </h1>
                    <DialogClose>
                    <X />
                    </DialogClose>
                  </div>
                  <Separator/>
                  <div className="flex gap-x-2">
                    <Avatar className="mt-1 h-11 w-11">
                      <AvatarImage
                        src={userData.user.image as string}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <Skeleton className="h-full w-full rounded-full" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-base  font-semibold text-black">
                      <h1 className="">{userData.user.name}</h1>
                      <Form {...postForm}>
                        <form>
                          <FormField
                            name="privacy"
                            control={postForm.control}
                            render={({ field }) => (
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="flex items-center gap-1 w-fit px-0" asChild>
                                    <Button
                                      variant="secondary"
                                      className="!h-fit space-x-1 px-2 py-1 bg-bg"
                                      
                                    >
                                      <Globe2 size={14} className="" />
                                      <p className="text-sm capitalize">
                                        {field.value}
                                      </p>
                                      <ChevronDown size={16} fill="black" />
                                    </Button>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Public">
                                      Public
                                    </SelectItem>
                                    <SelectItem value="Private">
                                      Private
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </form>
                      </Form>
                    </div>
                  </div>

                  <Form {...postForm}>
                    <form
                      className="w-full"
                      onSubmit={postForm.handleSubmit(
                        async (data: postType) => {
                          console.log(data);
                        },
                      )}
                    >
                      <FormField
                        name="text"
                        control={postForm.control}
                        render={({ field }) => (
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What's on your mind?"
                              className="w-full border-none py-1 font-primary text-lg outline-none"
                            />
                          </FormControl>
                        )}
                      />
                      <div className="mt-2 w-full">
                        {postForm.formState.errors.text && (
                          <p className="text-red-500">
                            {postForm.formState.errors.text.message}
                          </p>
                        )}

                        <div className="ml-auto flex w-full items-center gap-x-2">
                          <Button className="w-full" disabled={!postForm.formState.isValid}>Post</Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Post;
