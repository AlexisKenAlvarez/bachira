"use client";

import type { userDataOutput } from "@/lib/routerTypes";
import type { FileWithPath } from "@uploadthing/react";
import type { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteImage } from "@/hooks/useDeleteImage";
import { editProfileSchema } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase/supabaseClient";
import { api } from "@/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import { Input } from "@/ui/input";
import { Progress } from "@/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";
import { useUploadThing } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useDropzone } from "@uploadthing/react/hooks";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { generateClientDropzoneAccept } from "uploadthing/client";

const EditProfile = ({
  userDataQueryServer,
  username,
}: {
  userDataQueryServer: NonNullable<userDataOutput>;
  username: string;
}) => {
  const { data: userData }: { data: NonNullable<userDataOutput> } =
    api.user.getUser.useQuery(
      {
        username,
      },
      {
        initialData: userDataQueryServer,
      },
    );

  const saveProfile = api.user.saveProfile.useMutation({});
  const updateProfileMutation = api.user.uploadProfile.useMutation();
  const utils = api.useUtils()

  const [disabled, setDisabled] = useState(true);
  const { deleteImage } = useDeleteImage();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onClientUploadComplete: async (data) => {
      toast.dismiss("uploadToast");
      toast.success("Image uploaded!", { id: "uploadToast", duration: 3000 });
      console.log("MUST BE DISMISSED");

      await updateProfileMutation.mutateAsync({
        userId: userData.id!,
        image: data[0]?.url ?? "",
      }); 

      await supabase.auth.updateUser({
        data: {
          avatar_url: data ? data[0]?.url : "",
        },
      });

      await utils.user.getUser.invalidate()

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

  const form = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      website: userData.website ?? "",
      bio: userData.bio ?? "",
      gender: userData.gender ?? "IDK",
    },
  });

  useEffect(() => {
    void (async () => {
      if (files.length > 0) {
        toast.loading("Uploading image. Do not leave the page", {
          id: "uploadToast",
          duration: Infinity,
        });

        await deleteImage({
          deleteFrom: "profile",
          image: userData.image ?? "",
          userId: userData.id,
          withToast: false,
          deleteFromDb: true,
        });

        setOpen(false);
        await startUpload(files, {
          update: "profile",
        });

      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  async function onSubmit(values: z.infer<typeof editProfileSchema>) {
    toast.loading("Saving profile...", {
      id: "saveProfile",
      duration: Infinity,
    });
    const data = await saveProfile.mutateAsync({
      id: userData.id!,
      userData: {
        bio: userData.bio ?? "",
        gender: userData.gender as "MALE" | "FEMALE" | "IDK" | undefined,
        website: userData.website ?? "",
      },
      newData: values,
    });

    if (data.success) {
      toast.success("Changes saved!", { id: "saveProfile", duration: 3000 });
      setDisabled(true);
      router.refresh();
    }
  }

  function mapToPercentage(value: number) {
    return (Math.min(150, Math.max(0, value)) / 150) * 100;
  }

  const bioLength = form.watch("bio")?.length ?? 0;

  useEffect(() => {
    if (form.getValues("bio") !== userData.bio) {
      setDisabled(false);
    } else if (form.getValues("gender") !== userData.gender) {
      setDisabled(false);
    } else if (form.getValues("website") !== userData.website) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("bio"), form.watch("gender"), form.watch("website")]);

  return (
    <div className="mt-4 rounded-md bg-white p-5 font-primary sm:p-10">
      <h1 className="text-lg font-bold">Edit Profile</h1>
      <div className="my-4 mt-8 flex gap-x-2">
        <div className="w-[7.5rem]">
          <Avatar className="h-14 w-14">
            <AvatarImage src={userData.image ?? ""} className="object-cover" />
            <AvatarFallback>
              <Skeleton className="h-full w-full rounded-full object-cover" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full">
          <h2 className="font-medium">@{userData.username}</h2>
          <h3 className="">{userData.name}</h3>
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
              <p className="text-sm font-semibold text-primary">
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
                  <Button variant="secondary" className="relative">
                    <div
                      {...getRootProps()}
                      className="absolute left-0 top-0 h-full w-full"
                    >
                      <input {...getInputProps()} />
                    </div>
                    Upload New
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Delete Current</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete your profile photo and remove its data from our
                          servers.
                        </DialogDescription>

                        <div className="!mt-4 flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              await deleteImage({
                                deleteFrom: "profile",
                                image: userData.image ?? "",
                                userId: userData.id,
                                withToast: true,
                                deleteFromDb: true,
                              });

                              await supabase.auth.updateUser({
                                data: {
                                  image: "",
                                },
                              });

                              router.refresh();
                              setOpen(false);
                            }}
                          >
                            Delete Image
                          </Button>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>

                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
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
                      <SelectTrigger className="w-[180px] border">
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

          <Button
            type="submit"
            className="!mt-10 ml-[6.5rem]"
            disabled={disabled}
          >
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProfile;
