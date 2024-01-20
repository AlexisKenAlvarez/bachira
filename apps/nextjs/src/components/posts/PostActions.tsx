"use client";

import type { CommentPrivacyType } from "@/lib/postTypes";
import { useCallback, useState } from "react";
import { api } from "@/trpc/client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Separator } from "@/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bookmark,
  FlagTriangleRight,
  Loader,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import ReportDialog from "./ReportDialog";

const PostActions = ({
  author,
  userId,
  postId,
  openEdit,
  commentPrivacy,
}: {
  author: string;
  postId: number;
  userId: string;
  openEdit: () => void;
  commentPrivacy: CommentPrivacyType;
}) => {
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [commentPrivacyOpen, setCommentPrivacyOpen] = useState(false);
  const [reportCommentOpen, setReportCommentOpen] = useState(false);
  const utils = api.useUtils();

  const toggleReportComment = useCallback((open: boolean) => {
    setReportCommentOpen(open);
  }, []);

  const commentPrivacySchema = z.object({
    commentPrivacy: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"], {
      required_error: "Please select a comment privacy option.",
    }),
  });

  type commentType = z.infer<typeof commentPrivacySchema>;

  const form = useForm<commentType>({
    defaultValues: {
      commentPrivacy,
    },
    resolver: zodResolver(commentPrivacySchema),
  });

  const deleteMutation = api.posts.deletePost.useMutation({
    onSuccess: async () => {
      await utils.posts.getPosts.invalidate();
      setDeleteAlert(false);
      toast.success("Post deleted.");
    },
  });

  const commentPrivacyMutation = api.posts.editCommentPrivacy.useMutation({
    onSuccess: async () => {
      toast.success("Comment privacy updated.");
      await utils.posts.getPosts.invalidate({ postId });
      setCommentPrivacyOpen(false);
    },
  });

  const commentPrivacyList = [
    {
      id: "PUBLIC",
      name: "Public",
      description: "Anyone can comment on this post.",
    },
    {
      id: "FOLLOWERS",
      name: "Followers",
      description: "Only your followers can comment on this post.",
    },
    {
      id: "PRIVATE",
      name: "Only me",
      description: "Only you can comment on this post.",
    },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="mb-auto">
          <MoreHorizontal size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-medium ">
          <DropdownMenuItem className="items-start gap-3 pr-5 text-left">
            <Bookmark className="mt-1" size={23} />
            <div className="">
              <h2 className="text-sm md:text-base">Save post</h2>
              <p className="text-sm font-light text-subtle">
                Add this post to your saved items.
              </p>
            </div>
          </DropdownMenuItem>

          {author === userId && (
            <>
              {/* Author only actions */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="items-start gap-3 pr-5 text-left text-base"
                onClick={() => setCommentPrivacyOpen(true)}
              >
                <Pencil className="mt-1" size={23} />
                <h2 className="text-sm md:text-base">
                  Who can comment on this post?
                </h2>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="items-start gap-3 pr-5 text-left text-base"
                onClick={openEdit}
              >
                <MessageCircle className="mt-1" size={23} />
                <h2 className="text-sm md:text-base">Edit post</h2>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="group items-start gap-3 pr-5 text-left"
                onClick={() => {
                  setDeleteAlert(true);
                }}
              >
                <Trash
                  className="mt-1 transition-colors duration-100 ease-in-out group-hover:text-rd"
                  size={23}
                />
                <div className="">
                  <h2 className="text-sm transition-colors duration-100 ease-in-out group-hover:text-rd md:text-base">
                    Delete post
                  </h2>
                  <p className="text-sm font-light text-subtle">
                    Delete this post permanently
                  </p>
                </div>
              </DropdownMenuItem>
            </>
          )}

          {/* Other actions */}
          {author !== userId && (
            <DropdownMenuItem
              className="group items-start gap-3 pr-5 text-left"
              onClick={() => setReportCommentOpen(true)}
            >
              <FlagTriangleRight
                className="mt-1 transition-colors duration-100 ease-in-out group-hover:text-rd"
                size={23}
              />
              <div className="">
                <h2 className="text-sm transition-colors duration-100 ease-in-out group-hover:text-rd md:text-base">
                  Report post
                </h2>
                <p className="max-w-[13rem] text-sm font-light text-subtle md:max-w-full">
                  Report this post for violating our community
                </p>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change post comment privacy dialog */}
      <Dialog open={commentPrivacyOpen} onOpenChange={setCommentPrivacyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit comment privacy</DialogTitle>
          </DialogHeader>
          <Separator />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data: commentType) => {
                commentPrivacyMutation.mutate({
                  postId,
                  privacy: data.commentPrivacy,
                });
              })}
            >
              <FormField
                control={form.control}
                name="commentPrivacy"
                render={({ field }) => (
                  <FormControl>
                    <RadioGroup
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="space-y-2"
                    >
                      {commentPrivacyList.map((item) => (
                        <FormItem key={item.id}>
                          <FormLabel>
                            <div className="flex w-full flex-row-reverse items-center justify-between space-x-2 ">
                              <FormControl>
                                <RadioGroupItem value={item.id} />
                              </FormControl>

                              <div className="">
                                <h1 className="font-medium">{item.name}</h1>
                                <p className="text-sm text-subtle">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </FormLabel>
                          {item.id !== "PRIVATE" && <Separator />}
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
              />
              <Button
                className="ml-auto mt-5 block"
                disabled={commentPrivacyMutation.isPending}
              >
                Done
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ReportDialog open={reportCommentOpen} setOpen={toggleReportComment} postId={postId} authorId={author} />

      {/* Delete post confirmation */}
      <AlertDialog open={deleteAlert} onOpenChange={setDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post across all pages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate({ postId });
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <div className="flex space-x-2">
                  <Loader className="animate-spin" size={18} />
                  <p className="">Deleting</p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Trash size={18} />
                  <p className="">Continue</p>
                </div>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostActions;
