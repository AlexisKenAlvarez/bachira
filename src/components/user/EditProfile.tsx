"use client";
import { userDataOutput } from "@/lib/routerTypes";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EditProfile = ({
  userData,
}: {
  userData: NonNullable<userDataOutput>;
}) => {
  const formSchema = z.object({
    website: z.string().optional(),
    bio: z.string().optional(),
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
    <div className="font-primary">
      <h1 className="">Edit Profile</h1>
      <div className="">
        <Avatar className="h-14 w-14">
          <AvatarImage src={userData[0]?.image as string} />
          <AvatarFallback>
            <Skeleton className="h-full w-full rounded-full" />
          </AvatarFallback>
        </Avatar>

        <div className="">
          <h2 className="">{userData[0]?.username}</h2>
          <h3 className="">{userData[0]?.name}</h3>
          <p className="text-gchat">Change profile photo.</p>
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
                    <FormDescription>
                      This won’t be part of your public profile.
                    </FormDescription>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProfile;
