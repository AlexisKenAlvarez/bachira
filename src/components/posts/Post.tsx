"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "next-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ChevronDown, Loader, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Form, FormControl, FormField } from "@/components/ui/form";
import { privacyData } from "@/lib/constants";

const Post = ({ userData }: { userData: Session }) => {
  const utils = api.useUtils();
  const PRIVACY = ["PUBLIC", "FOLLOWERS", "PRIVATE"] as const;
  
  const router = useRouter();
  const [postOpen, setPostOpen] = useState(false);

  const createPost = api.posts.createPost.useMutation();
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
      privacy: "PUBLIC",
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
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger className="w-full">
            <input
              type="text"
              placeholder="What's on your mind?"
              className="w-full cursor-text select-none rounded-lg border-none bg-bg px-4 py-3 font-primary outline-none"
            />
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4">
              <div className="flex justify-between text-2xl font-semibold text-black">
                <h1 className="">Create a post </h1>

                <DialogClose>
                  <X />
                </DialogClose>
              </div>
              <Separator />
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
                              <SelectTrigger
                                className="flex w-fit items-center gap-1 px-0"
                                asChild
                              >
                                <Button
                                  variant="secondary"
                                  className="!h-fit space-x-[2px] bg-bg px-2 py-1"
                                >
                                  {privacyData.map((data, i) => 
                                  data.value === postForm.getValues("privacy") &&
                                  <div className="" key={i}>{data.icon}</div>
                                  )}
                                  <span className="text-sm capitalize">
                                    {field.value.toLowerCase()}
                                  </span>
                                  <ChevronDown size={16} fill="black" />
                                </Button>
                              </SelectTrigger>
                              <SelectContent>
                                {privacyData.map((data, i) => 
                                <SelectItem value={data.value} className="capitalize" key={i}>{data.value.toLowerCase()}</SelectItem>
                                )}
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
                  onSubmit={postForm.handleSubmit(async (data: postType) => {
                    try {
                      await createPost.mutateAsync({
                        userId: userData.user.id,
                        ...data,
                      });
                      utils.posts.getPosts.invalidate();
                      toast.success("Post created successfully.");
                      postForm.reset();
                      router.refresh();
                      setPostOpen(false);
                    } catch (error) {
                      console.log(error);
                    }
                  })}
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
                      <Button
                        className={cn("w-full", {
                          "pointer-events-none opacity-50":
                            createPost.isLoading,
                        })}
                        disabled={!postForm.formState.isValid}
                      >
                        {createPost.isLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Post"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Post;
