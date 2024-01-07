"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ChevronDown, Loader, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { DialogClose } from "@/components/ui/dialog";

import { Form, FormControl, FormField } from "@/components/ui/form";
import { privacyData } from "@/lib/constants";
import { DialogUserType } from "@/lib/userTypes";
import { PostEditType } from "@/lib/postTypes";
import { useState } from "react";

const PostDialogContent = ({
  user,
  post,
  closeDialog,
}: {
  user: DialogUserType;
  post?: PostEditType;
  closeDialog: () => void;
}) => {
  console.log("🚀 ~ file: PostDialogContent.tsx:42 ~ post:", post);
  const utils = api.useUtils();
  const PRIVACY = ["PUBLIC", "FOLLOWERS", "PRIVATE"] as const;
  const [
    editing,
    // setEditing
  ] = useState(post ? true : false);
  const { userImage, username, userId } = user;

  const router = useRouter();

  const createPost = api.posts.createPost.useMutation();
  const editPost = api.posts.editPost.useMutation();
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
      text: editing ? post?.postText : "",
      privacy: editing ? post?.privacy : "PUBLIC",
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-2xl font-semibold text-black">
        <h1 className="">{editing ? "Edit post" : "Create a post"}</h1>

        <DialogClose>
          <X />
        </DialogClose>
      </div>
      <Separator />
      <div className="flex gap-x-2">
        <Avatar className="mt-1 h-11 w-11">
          <AvatarImage src={userImage} className="object-cover" />
          <AvatarFallback>
            <Skeleton className="h-full w-full rounded-full" />
          </AvatarFallback>
        </Avatar>
        <div className="text-base  font-semibold text-black">
          <h1 className="">{username}</h1>
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
                          {privacyData.map(
                            (data, i) =>
                              data.value === postForm.getValues("privacy") && (
                                <div className="" key={i}>
                                  {data.icon}
                                </div>
                              ),
                          )}
                          <span className="text-sm capitalize">
                            {field.value.toLowerCase()}
                          </span>
                          <ChevronDown size={16} fill="black" />
                        </Button>
                      </SelectTrigger>
                      <SelectContent>
                        {privacyData.map((data, i) => (
                          <SelectItem
                            value={data.value}
                            className="capitalize"
                            key={i}
                          >
                            {data.value.toLowerCase()}
                          </SelectItem>
                        ))}
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
              if (editing) {
                await editPost.mutateAsync({
                  originalPost: post!,
                  editedPost: {
                    postText: data.text,
                    privacy: data.privacy,
                  }
                });

                utils.posts.getPosts.invalidate();
                toast.success("Post has been updated!");
                postForm.reset();
                router.refresh();
                closeDialog();

              } else {
                await createPost.mutateAsync({
                  userId: userId,
                  ...data,
                });
                utils.posts.getPosts.invalidate();
                toast.success("Post created successfully.");
                postForm.reset();
                router.refresh();
                closeDialog();
              }
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
                  "pointer-events-none opacity-50": createPost.isLoading,
                })}
                disabled={!postForm.formState.isValid}
              >
                {createPost.isLoading || editPost.isLoading ? (
                  <Loader className="animate-spin" />
                ) : editing ? (
                  "Edit"
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PostDialogContent;
