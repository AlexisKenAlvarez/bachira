import { api } from "@/trpc/client";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Separator } from "@/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { POST_REPORT_TYPE } from "@bachira/db/schema/schema";

const ReportDialog = ({
  open,
  setOpen,
  postId,
  authorId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  postId: number;
  authorId: string;
}) => {
  const reportMutation = api.posts.reportPost.useMutation({
    onSuccess: () => {
      toast.success("Post reported successfully");
      setOpen(false)
    },
    onError: () => {
      toast.error("Sorry, something went wrong");
    },
  });

  const reportList = [
    {
      label: "Sexual Content",
      value: "SEXUAL_CONTENT",
    },
    {
      label: "Hateful Content",
      value: "HATEFUL_CONTENT",
    },
    {
      label: "Violent Content",
      value: "VIOLENT_CONTENT",
    },
    {
      label: "Spam or misleading",
      value: "SPAM",
    },
    {
      label: "Child Abuse",
      value: "CHILD_ABUSE",
    },
  ];

  const reportSchema = z.object({
    type: z.enum([...POST_REPORT_TYPE]),
  });

  type reportType = z.infer<typeof reportSchema>;

  const form = useForm<reportType>({
    defaultValues: {
      type: "SEXUAL_CONTENT",
    },
    resolver: zodResolver(reportSchema),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit comment privacy</DialogTitle>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data: reportType) => {
              try {
                await reportMutation.mutateAsync({
                  type: data.type,
                  postId,
                  userId: authorId,
                });
              } catch (error) {
                console.log(error);
              }
            })}
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    className="space-y-2"
                  >
                    {reportList.map((item) => (
                      <FormItem key={item.label}>
                        <FormLabel>
                          <div className="flex w-full flex-row-reverse items-center justify-between space-x-2 text-base">
                            <FormControl>
                              <RadioGroupItem value={item.value} />
                            </FormControl>

                            <h1 className="font-medium">{item.label}</h1>
                          </div>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            />
            <Button className="ml-auto mt-6 block">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
