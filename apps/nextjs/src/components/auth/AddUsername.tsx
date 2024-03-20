"use client";

import type { Session } from "@supabase/gotrue-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageSmooth from "@/components/shared/ImageSmooth";
import { supabase } from "@/supabase/supabaseClient";
import { api } from "@/trpc/client";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { RouterOutputs } from "@bachira/api";

type ExtendedSession = RouterOutputs["user"]["getSession"] & {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
};

const AddUsername = ({ session }: { session: ExtendedSession }) => {
  const router = useRouter();
  const addUsernameMutation = api.user.createUser.useMutation();

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

  if (!session) return null;

  return (
    <section className="z-10 flex h-auto min-h-screen w-full bg-white pb-20 sm:bg-bggrey sm:pb-0">
      <ImageSmooth
        src="/background.jpg"
        className="absolute left-0 top-0 hidden h-full w-full object-cover sm:block"
      />
      <div className="z-10 w-full place-content-center sm:grid">
        <div className="h-full sm:rounded-xl sm:shadow-md">
          <div className="flex w-full flex-col space-y-4 bg-white px-7 py-10 font-primary sm:min-h-20 sm:w-[26rem] sm:rounded-xl">
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
                        await addUsernameMutation.mutateAsync({
                          email: session.email!,
                          username: data.username,
                          id: session.id,
                          image: session.user_metadata.avatar_url!,
                          name: session.user_metadata.full_name!,
                        });

                        await supabase.auth.updateUser({
                          data: {
                            username: data.username,
                          },
                        });

                        router.refresh();
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
      <div className="relative z-10 hidden  w-full items-center overflow-hidden font-primary lg:flex">
        <div className="">
          <h1 className="block h-fit text-9xl font-bold">Bachira</h1>
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
