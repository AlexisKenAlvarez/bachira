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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDeleteImage } from "@/hooks/useDeleteImage";
import { DialogClose } from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { editProfileSchema } from "@/lib/zodSchema";

const EditProfile = ({
  userData,
}: {
  userData: NonNullable<userDataOutput>;
}) => {
  const { data: session, update } = useSession();
  const [disabled, setDisabled] = useState(true);
  const { deleteImage } = useDeleteImage();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const saveProfile = api.user.saveProfile.useMutation({});
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (data) => {
      toast.success("Image uploaded!", { id: "uploadToast", duration: 3000 });
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          image: data ? data[0]?.url : ''
        },
      };

      await update(newSession);
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
      website: userData[0]?.website ?? '',
      bio: userData[0]?.bio ?? '',
      gender: userData[0]?.gender ?? 'IDK',
    },
  });

  useEffect(() => {
    if (files.length > 0) {
      deleteImage({
        deleteFrom: "profile",
        image: userData[0]?.image as string,
        userId: userData[0]?.id,
        withToast: false,
        deleteFromDb: true,
      });

      setOpen(false);
      startUpload(files, {
        update: "profile",
      });
      toast.loading("Uploading image. Do not leave the page", {
        id: "uploadToast",
        duration: Infinity,
      });
    }
  }, [files]);

  async function onSubmit(values: z.infer<typeof editProfileSchema>) {
    console.log(values);
    toast.loading("Saving profile...", {
      id: "saveProfile",
      duration: Infinity,
    });
    const data = await saveProfile.mutateAsync({
      id: userData[0]?.id as string,
      userData: {
        bio: userData[0]?.bio ?? "",
        gender: userData[0]?.gender as "MALE" | "FEMALE" | "IDK" | undefined,
        website: userData[0]?.website ?? "",
      },
      newData: values,
    });

    if (data.success) {
      toast.success("Changes saved!", { id: "saveProfile", duration: 3000 });
      setDisabled(true)
      router.refresh()
    }
     
  }

  function mapToPercentage(value: number) {
    return (Math.min(150, Math.max(0, value)) / 150) * 100;
  }

  const bioLength = form.watch("bio")?.length ?? 0;

  useEffect(() => {

    if (form.getValues("bio") !== userData[0]?.bio) {
      setDisabled(false);
    } else if (form.getValues("gender") !== userData[0]?.gender) {
      setDisabled(false);
    } else if (form.getValues('website') !== userData[0]?.website) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }

  }, [
    form.watch("bio"),
    form.watch("gender"),
    form.watch("website"),
  ]);

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
                  <Button
                    variant="secondary"
                    className="relative"
                  >
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
                                image: userData[0]?.image as string,
                                userId: userData[0]?.id,
                                withToast: true,
                                deleteFromDb: true,
                              });

                              const newSession = {
                                ...session,
                                user: {
                                  ...session?.user,
                                  image: "",
                                },
                              };

                              await update(newSession);

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

          <Button type="submit" className="!mt-10 ml-[6.5rem]" disabled={disabled}>
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProfile;
