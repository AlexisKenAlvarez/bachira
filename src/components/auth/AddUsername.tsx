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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AddUsername = ({ email }: { email: string }) => {
  const { data: session, update } = useSession();
  const router = useRouter();

  const updateUsername = api.user.updateUsername.useMutation({
    onSuccess: async () => {
      const newSession = {
        ...session,
        user: {
          ...session?.user,
          username: usernameForm.getValues("username"),
        },
      };

      await update(newSession);

      router.refresh();
    },
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

  function isValidInput(input: string) {
    // Regular expression pattern allowing only characters a-z and A-Z
    const pattern = /^[a-zA-Z0-9]+$/;

    // Test the input against the pattern
    return pattern.test(input);
  }

  return (
    <section className="flex h-auto min-h-screen w-full bg-white pb-20 sm:bg-bggrey sm:pb-0">
      <ImageSmooth src="/background.jpg" className="absolute top-0 left-0 w-full h-full object-cover sm:block hidden" />
      <div className="w-full place-content-center sm:grid z-10">
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

                    try {
                      if (isValidInput(data.username)) {
                        await updateUsername.mutateAsync({
                          username: data.username.trim(),
                          email,
                        });
                      } else {
                        toast.error("Username must only contain alphabets");
                        setDebounce(false);
                      }
                    } catch (error) {
                      console.log(error);
                      toast.error("Username is already taken!");
                      setDebounce(false);
                    }
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
                          className="focus-visible:ring-none focus-visible:border-blue-200 !mt-[4px] focus-visible:ring-transparent"
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
      <div className="relative hidden w-full  font-primary items-center overflow-hidden lg:flex z-10">
        <div className="">
          <h1 className="block h-fit text-9xl font-bold">
            Bachira
          </h1>
          <p className="text-xl">
            Just one step ahead to experience the best social media in the
            world.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AddUsername;
