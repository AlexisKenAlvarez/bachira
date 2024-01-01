import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { SessionUser } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

const Comments = ({
  user,
  commentOpen,
}: {
  user: SessionUser;
  commentOpen: boolean;
}) => {
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

  return (
    <div
      className={cn(
        "max-h-0 overflow-hidden transition-all duration-500 ease-in-out",
        { "max-h-72": commentOpen },
      )}
    >
      <div className="m flex w-full items-start gap-2 p-3 px-5">
        <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <img
            src={user.image as string}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        </div>
        <Form {...commentForm}>
          <form
            onSubmit={commentForm.handleSubmit((data: commentType) =>
              console.log(data),
            )}
            className="flex w-full items-center gap-2"
          >
            <FormField
              control={commentForm.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="relative w-full">
                  <FormControl>
                    <TextareaAutosize
                      {...field}
                      placeholder="Write a comment..."
                      maxLength={200}
                      className="bg-bg outline-0 w-full h-full py-2 px-3 resize-none rounded-md text-sm pr-28"
                    />
                  </FormControl>
                  <button className={cn('absolute  right-4 top-1 opacity-50 pointer-events-none', {'pointer-events-auto opacity-100': commentForm.formState.isValid})}>
                    <SendHorizontal
                      className=""
                      size={16}
                      fill="#3066b2"
                      stroke="#3066b2"
                    />
                  </button>

                  <p className="absolute  right-10 top-1 text-xs text-subtle">
                    {commentForm.watch("comment").length}/200
                  </p>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Comments;
