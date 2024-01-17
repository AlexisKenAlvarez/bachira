"use client";

import type { PostEditType } from "@/lib/postTypes";
import type { DialogUserType, MentionedType } from "@/lib/userTypes";
import type { SuggestionDataItem } from "react-mentions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { DialogClose } from "@/ui/dialog";
import { Form, FormControl, FormField } from "@/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { privacyData } from "@/lib/constants";
import { cn, getToMentionUsers } from "@/lib/utils";
import defaultMentionStyle from "@/styles/defaultStyle";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader, X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mention, MentionsInput } from "react-mentions";
import { z } from "zod";

import { Separator } from "@/ui/separator";
import MentionSuggestion from "./MentionSuggestion";

const PostDialogContent = ({
  user,
  post,
  closeDialog,
}: {
  user: DialogUserType;
  post?: PostEditType;
  closeDialog: () => void;
}) => {
  const utils = api.useUtils();

  const PRIVACY = ["PUBLIC", "FOLLOWERS", "PRIVATE"] as const;
  const [
    editing,
    // setEditing
  ] = useState(post ? true : false);
  const { userImage, username, userId } = user;
  const [toMention, setToMention] = useState("");
  const [mentioned, setMentioned] = useState<MentionedType[]>([]);

  const router = useRouter();

  const createPost = api.posts.createPost.useMutation();
  const editPost = api.posts.editPost.useMutation();
  const mentionQuery = api.user.mentionUser.useQuery({
    username: toMention,
  });

  const postObject = z.object({
    text: z
      .string()
      .min(1)
      .max(500, { message: "Maximum characters allowed reached." }),
    privacy: z.enum(PRIVACY),
    mentioned: z
      .array(
        z.object({
          username: z.string(),
        }),
      )
      .nullable(),
  });

  type postType = z.infer<typeof postObject>;

  const postForm = useForm<postType>({
    resolver: zodResolver(postObject),
    defaultValues: {
      text: editing ? post?.postText : "",
      privacy: editing ? post?.privacy : "PUBLIC",
      mentioned: null,
    },
  });

  const fetchUsers = (
    query: string,
    callback: (data: SuggestionDataItem[]) => void,
  ) => {
    setToMention(query);

    const transformedDataArray = mentionQuery.data?.searchedUsers.map(
      (item) => ({
        display: item.username,
        id: item.id,
        image: item.image ?? "",
      }),
    );

    if (transformedDataArray === undefined) {
      return;
    }

    callback(transformedDataArray);
  };

  const handleAdd = (id: string | number, display: string) => {
    const userData = mentionQuery.data?.searchedUsers.filter(
      (user) => user.username === display,
    );
    console.log(id);
    if (userData) {
      setMentioned((data) => [
        ...data,
        {
          username: userData[0]!.username,
          image: userData[0]!.image ?? "",
          id: userData[0]!.id,
        },
      ]);
    }
  };

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
                  },
                });

                await utils.posts.getPosts.invalidate();
                toast.success("Post has been updated!");
                postForm.reset();
                router.refresh();
                closeDialog();
              } else {
                const { toMention } = getToMentionUsers(data.text, mentioned);

                await createPost.mutateAsync({
                  userId: userId,
                  ...data,
                  toMention,
                  authorImage: userImage,
                  username,
                });
                await utils.posts.getPosts.invalidate();
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
                <MentionsInput
                  {...field}
                  placeholder="What's on your mind?"
                  className="outline-nonebg-slate-50 !focus-visible:outline-none w-full border-none py-1 font-primary text-lg !outline-none"
                  style={defaultMentionStyle}
                >
                  <Mention
                    trigger="@"
                    displayTransform={(_, display) => `@${display}`}
                    appendSpaceOnAdd
                    data={fetchUsers}
                    renderSuggestion={MentionSuggestion}
                    className="bg-primary/10"
                    markup="@[__display__]"
                    onAdd={handleAdd}
                  />
                </MentionsInput>
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
                  "pointer-events-none opacity-50": createPost.isPending,
                })}
                disabled={!postForm.formState.isValid}
              >
                {createPost.isPending || editPost.isPending ? (
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
