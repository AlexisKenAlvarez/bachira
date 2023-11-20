"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { userDataOutput } from "@/lib/routerTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/utils/uploadthing";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { FileWithPath } from "@uploadthing/react";
import { useDropzone } from "@uploadthing/react/hooks";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const EditProfile = ({
  userData,
}: {
  userData: NonNullable<userDataOutput>;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      toast.success("Image uploaded!", { id: "uploadToast", duration: 3000 });
      router.refresh();
    },
    onUploadError: () => {
      toast.error("Sorry there was an error", {
        id: "uploadToast",
        duration: 3000,
      });
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
    multiple: false,
    noDrag: true,
  });

  const formSchema = z.object({
    website: z.string().url().optional().or(z.literal("")),
    bio: z.string().max(150).optional(),
    gender: z.enum(["MALE", "FEMALE", "IDK"]).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website: "",
      bio: "",
      gender: "IDK",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function mapToPercentage(value: number) {
    return (Math.min(150, Math.max(0, value)) / 150) * 100;
  }

  const bioLength = form.watch("bio")?.length ?? 0;

  return (
    <div className="p-5 font-primary sm:p-10">
      <h1 className="text-lg font-bold">Edit Profile</h1>
      <div className="my-4 mt-8 flex gap-x-2">
        <div className="w-[7.5rem]">
          <Avatar className="h-14 w-14">
            <AvatarImage src={userData[0]?.image as string} />
            <AvatarFallback>
              <Skeleton className="h-full w-full rounded-full" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full">
          <h2 className="font-medium">@{userData[0]?.username}</h2>
          <h3 className="">{userData[0]?.name}</h3>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
            }}
          >
            <button
              onClick={() => {
                setOpen(true);
              }}
            >
              {" "}
              <p className="text-sm font-semibold text-gchat">
                Change profile photo.
              </p>
            </button>
            <DialogContent className="!w-fit">
              <DialogHeader>
                <DialogTitle>Change profile photo</DialogTitle>
                <DialogDescription>
                  The changes here will immediately reflect on your profile.
                </DialogDescription>
                <div className="!mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    className="hover:bg-gchat hover:text-white relative"
                  >
                    <div {...getRootProps()} className="w-full absolute top-0 left-0 h-full">
                      <input {...getInputProps()} /> 
                    </div>
                    Upload New
                  </Button>
                  <Button variant="destructive">Delete Current</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" max-w-lg space-y-4"
        >
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormLabel className="w-32 font-semibold">Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Website"
                    className="focus-visible:ring-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="flex items-start">
                <FormLabel className="mt-2 w-32 font-semibold">Bio</FormLabel>
                <FormControl>
                  <div className="w-full flex-col">
                    <Textarea
                      placeholder="Enter your bio"
                      className="resize-none focus-visible:ring-transparent"
                      {...field}
                      maxLength={150}
                    />
                    <Progress
                      className={"mt-2 h-2 px-0"}
                      indicatorClassName={cn("", {
                        "bg-red-500": bioLength >= 150,
                      })}
                      value={mapToPercentage(bioLength)}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="flex items-start">
                <FormLabel className="mt-2 w-32 font-semibold">
                  Gender
                </FormLabel>
                <FormControl>
                  <div className="w-full flex-col">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDK">Prefer not to say</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="mt-2">
                      This won’t be part of your public profile.
                    </FormDescription>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="!mt-10 ml-[6.5rem]">
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProfile;
