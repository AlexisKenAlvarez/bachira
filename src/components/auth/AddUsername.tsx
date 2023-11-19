"use client";
import ImageSmooth from "@/components/shared/ImageSmooth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AddUsername = ({ email }: { email: string }) => {
  const { data: session, update } = useSession();
  const router = useRouter()

  const updateUsername = api.user.updateUsername.useMutation({
    onError: () => {
      toast.error("Sorry, Something went wrong!");
      setDebounce(false);
    },
    onSuccess: async () => {
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          username: usernameForm.getValues("username"),
        },
      };

      await update(newSession);

      router.refresh()
    }
  });

  const [debounce, setDebounce] = useState(false);

  const usernameObject = z.object({
    username: z
      .string()
      .min(3, "Must be 3 characters or more")
      .max(20, "Must not be more than 20 characters"),
  });

  type usernameType = z.infer<typeof usernameObject>;

  const usernameForm = useForm<usernameType>({
    resolver: zodResolver(usernameObject),
    defaultValues: {
      username: "",
    },
  });

  return (
    <section className="flex h-auto min-h-screen w-full bg-white pb-20 sm:bg-bggrey sm:pb-0">
      <div className="w-full place-content-center sm:grid">
        <div className="h-full sm:rounded-xl sm:shadow-md">
          <div className="sm:min-h-20 flex w-full flex-col space-y-4 bg-white px-7 py-10 font-primary sm:w-[26rem] sm:rounded-xl">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Enter username</h1>
              <h2 className="">
                Provide a username to complete your registration
              </h2>
            </div>

            <Form {...usernameForm} key="first-form">
              <form
                key="first-form"
                onSubmit={usernameForm.handleSubmit(async (data) => {
                  if (!debounce) {
                    setDebounce(true);
                    await updateUsername.mutateAsync({
                      username: data.username,
                      email,
                    });

                  }
                })}
              >
                <FormField
                  control={usernameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {usernameForm.formState.errors.username?.message}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                          key="first-username"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button className="mt-3 w-full" disabled={debounce}>
                  {debounce ? (
                    <Loader className="animate-spin text-lg " />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="relative hidden w-full overflow-hidden lg:block">
        <Link href="/">
          <h1 className="transition-text absolute right-0 top-0 z-10 m-auto h-fit font-primary text-[12rem] text-white/20 duration-300 ease-in-out hover:text-white/50 xl:text-[15rem]">
            GChat
          </h1>
        </Link>

        <ImageSmooth src="/auth/register.webp" />
      </div>
    </section>
  );
};

export default AddUsername;
