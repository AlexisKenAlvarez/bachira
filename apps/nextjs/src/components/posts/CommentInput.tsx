import type { PostType } from "@/lib/postTypes";
import type {
  MentionedType,
  SessionUser,
  UserFollowingType,
} from "@/lib/userTypes";
import type { SuggestionDataItem } from "react-mentions";
import { useState } from "react";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem } from "@/ui/form";
import { cn, getToMentionUsers } from "@/lib/utils";
import defaultMentionStyle from "@/styles/commentBoxStyle";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mention, MentionsInput } from "react-mentions";
import { z } from "zod";

import MentionSuggestion from "./MentionSuggestion";

const CommentInput = ({
  user,
  post,
  userFollowing,
}: {
  user: SessionUser;
  post: PostType;
  userFollowing: UserFollowingType;
}) => {
  const utils = api.useUtils();
  const [toMention, setToMention] = useState("");
  const [mentioned, setMentioned] = useState<MentionedType[]>([]);

  const commentMutation = api.posts.addComment.useMutation({
    onError(err, _) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      } else if (errMessage === "UNPROCESSABLE_CONTENT") {
        toast.error("The author may have changed the post's comment privacy");
      }
    },
    onSuccess: async () => {
      await utils.posts.getComments.invalidate();
      toast.success("Comment posted!");
      commentForm.reset();
    },
  });

  const mentionQuery = api.user.mentionUser.useQuery({
    username: toMention,
  });

  const commentSchema = z.object({
    comment: z.string().min(1).max(200),
  });

  type commentType = z.infer<typeof commentSchema>;

  const commentForm = useForm<commentType>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
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
    <div className="flex w-full items-start gap-2  px-5 pb-3 pt-3">
      <div className=" mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full ">
        <Image
          width="500"
          height="500"
          src={user.image ?? ""}
          alt={user.username}
          className="h-full w-full object-cover"
        />
      </div>
      <Form {...commentForm}>
        <form
          onSubmit={commentForm.handleSubmit(async (data: commentType) => {
            try {
              const { toMention } = getToMentionUsers(data.comment, mentioned);
              await commentMutation.mutateAsync({
                text: data.comment,
                postId: post.id,
                userId: user.id,
                authorId: post.userId,
                username: user.username,
                image: user.image ?? "",
                toMention,
                userFollowing,
              });
            } catch (error) {
              console.log(error);
            }
          })}
          className="flex w-full min-w-0 items-center gap-2"
        >
          <FormField
            control={commentForm.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="flex h-auto w-full items-start rounded-md bg-bg">
                <FormControl className="!h-auto" id="Form control">
                  <MentionsInput
                    singleLine={false}
                    {...field}
                    maxLength={200}
                    placeholder="Write a comment..."
                    className="h-full w-full resize-none rounded-md bg-bg px-3 py-2 text-sm outline-0"
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
                <div className="!mt-3 flex shrink-0 flex-row-reverse items-center gap-2  pr-4">
                  <button
                    className={cn("pointer-events-none  opacity-50", {
                      "pointer-events-auto opacity-100":
                        commentForm.formState.isValid,
                    })}
                    disabled={
                      commentMutation.isPending ??
                      !commentForm.formState.isValid
                    }
                  >
                    <SendHorizontal
                      className=""
                      size={16}
                      fill="#3066b2"
                      stroke="#3066b2"
                    />
                  </button>

                  <p className="text-xs text-subtle">
                    {commentForm.watch("comment").length}/200
                  </p>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default CommentInput;
