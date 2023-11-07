"use client";
import ImageSmooth from "@/components/shared/ImageSmooth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signIn } from 'next-auth/react'
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
import { Github, Loader } from "lucide-react";
import Link from "next/link";

interface AuthPageProps {
  type: "sign in" | "sign up";
}

const AuthForm = ({ type }: AuthPageProps) => {


  const addUser = api.user.addUser.useMutation({
    onSettled: () => {
      console.log("User has been added");
    },
  });

  const checkEmail = api.user.checkEmail.useMutation();

  const [pending, setPendingVerification] = useState(false);
  const [debounce, setDebounce] = useState(false);
  const [userDebounce, setUserDebounce] = useState(false);
  const [stayLoading, setStayLoading] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [transferSignup, setNeedsTransfer] = useState(false);
  const [signupData, setSignupData] = useState<authType>();

  const authObject = z
    .object({
      email: z.string().email(),
      password: z
        .string()
        .min(8, "Must be 8 characters or more")
        .max(20, "Must not be more than 20 characters"),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (type === "sign up") {
          return data.password === data.confirmPassword;
        }
        return true; // Return true to bypass the refine when type is not "sign up"
      },
      { message: "Password does not match", path: ["confirmPassword"] },
    );

  const usernameObject = z.object({
    username: z
      .string()
      .min(3, "Must be 3 characters or more")
      .max(20, "Must not be more than 20 characters"),
  });

  const secondaryObject = z.object({
    username: z
      .string()
      .min(3, "Must be 3 characters or more")
      .max(20, "Must not be more than 20 characters"),
    firstName: z.string().max(40, "Your first name is too long"),
    lastName: z.string().max(30, "Your last name is too long"),
  });

  type authType = z.infer<typeof authObject>;
  type usernameType = z.infer<typeof usernameObject>;
  type secondaryType = z.infer<typeof secondaryObject>;

  const authForm = useForm<authType>({
    resolver: zodResolver(authObject),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const usernameForm = useForm<usernameType>({
    resolver: zodResolver(usernameObject),
    defaultValues: {
      username: "",
    },
  });

  const secondCredentialForm = useForm<secondaryType>({
    resolver: zodResolver(usernameObject),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  const { handleSubmit: handleSubmit2, control: control2 } =
    secondCredentialForm;

  const signupSubmit =  (data: authType) => {
    console.log(data);
    // Signup with credentials logic
  };

  const signinSubmit =  (data: authType) => {
    console.log(data);
    // Signin with credentials logic
  };

  const formSubmit = async (data: authType) => {
    if (!debounce) {
      setDebounce(true);
      const existing = await checkEmail.mutateAsync({ email: data.email });

      if (type === "sign up") {
        if (existing) {
          authForm.setError("email", {
            type: "custom",
            message: "Email already exists",
          });
          // Do the signup logic
          setDebounce(false);
        }
      } else {
        // Do the signin
      }
    }
  };

  const signInWith = (strategy: "github" | "google") => {
    // OAuth logic
  };

  const usernameOnly = (
    <div className="">
      <Form {...usernameForm} key="first-form">
        <form
          key="first-form"
          onSubmit={usernameForm.handleSubmit((data) => {
            console.log(data);
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
          <Button className="mt-3 w-full">
            {userDebounce ? (
              <Loader className="animate-spin text-lg " />
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );

  return (
    <section className="flex h-auto min-h-screen w-full bg-white pb-20 sm:bg-bggrey sm:pb-0">
      <div className="w-full place-content-center sm:grid">
        <div className="h-full sm:rounded-xl sm:shadow-md">
          <div className="sm:min-h-20 flex w-full flex-col space-y-4 bg-white px-7 py-10 font-secondary sm:w-[26rem] sm:rounded-xl">
            <div className=" text-center">
              <h1 className="text-2xl font-bold">
                {type === "sign in"
                  ? "Welcome back to GChat"
                  : "Create your account"}{" "}
              </h1>
              <p className="text-black/70">
                {type === "sign in"
                  ? "Login to your account and start downloading."
                  : "Create an account and start downloading."}
              </p>
            </div>

            <div className="oauth flex flex-col gap-3">
              <Button
                variant="outline"
                className="relative w-full py-5"
                onClick={() => {
                  signIn('google', {callbackUrl: '/'})
                }}
              >
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-2 block w-7"
                >
                  <path
                    d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M6.30603 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.65603 8.337 6.30603 14.691Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M23.9999 44C29.1659 44 33.8599 42.023 37.4089 38.808L31.2189 33.57C29.1435 35.1483 26.6074 36.002 23.9999 36C18.7979 36 14.3809 32.683 12.7169 28.054L6.19495 33.079C9.50495 39.556 16.2269 44 23.9999 44Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M43.611 20.083H42V20H24V28H35.303C34.5142 30.2164 33.0934 32.1532 31.216 33.571L31.219 33.569L37.409 38.807C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
                    fill="#1976D2"
                  />
                </svg>

                <p className="font-semibold">
                  {type.charAt(0).toUpperCase() + type.slice(1)} with Google
                </p>
              </Button>
              <Button
                variant="outline"
                className="relative w-full py-5"
                onClick={() => {
                  signIn('github')
                }}
              >
                <Github className="absolute left-2 text-2xl" />
                <p className="font-semibold">
                  {type.charAt(0).toUpperCase() + type.slice(1)} with Github
                </p>
              </Button>
            </div>

            <div className="flex w-full items-center gap-4">
              <Separator className="" />
              <p className="text-black/30">OR</p>
              <Separator className="" />
            </div>

            <Form {...authForm}>
              <form
                onSubmit={authForm.handleSubmit(formSubmit)}
                className="flex flex-col gap-y-4"
                key={type}
              >
                <FormField
                  control={authForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="m-0 gap-0">
                      <FormLabel className="m-0 py-0">
                        Email{" "}
                        <span>
                          {" "}
                          {authForm.formState.errors.email
                            ? ` - ${authForm.formState.errors.email.message}`
                            : null}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="sample@GChat.com"
                          className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={authForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="m-0 gap-0">
                      <FormLabel className="m-0 py-0">
                        Password
                        <span>
                          {" "}
                          {authForm.formState.errors.password
                            ? ` - ${authForm.formState.errors.password.message}`
                            : null}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {type === "sign up" ? (
                  <FormField
                    control={authForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="m-0 gap-0">
                        <FormLabel className="m-0 py-0">
                          Confirm Password
                          <span>
                            {" "}
                            {authForm.formState.errors.confirmPassword
                              ? ` - ${authForm.formState.errors.confirmPassword.message}`
                              : null}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Re-type your password"
                            className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : null}

                <Button className="mt-2 w-full bg-black">
                  {debounce ? (
                    <Loader className="animate-spin text-lg " />
                  ) : (
                    type.charAt(0).toUpperCase() + type.slice(1)
                  )}
                </Button>
                <Link
                  href="/signin/reset-password"
                  className="text-center text-sm hover:underline"
                >
                  <p className="">Trouble signing in?</p>
                </Link>
              </form>
            </Form>
          </div>
          <div className="flex items-center justify-center gap-[5px] bg-white px-7 text-center font-secondary text-sm sm:rounded-xl sm:bg-bggrey sm:py-6">
            <p className="">
              {type === "sign in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>

            {type === "sign up" ? (
              <button>
                <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
                  Sign in
                </p>
              </button>
            ) : (
              <button>
                <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
                  Sign up
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden w-full overflow-hidden lg:block">
        <Link href="/">
          <h1 className="transition-text absolute right-0 top-0 z-10 m-auto h-fit font-primary text-[12rem] text-white/20 duration-300 ease-in-out hover:text-white/50 xl:text-[15rem]">
            GChat
          </h1>
        </Link>
        {type === "sign in" ? (
          <ImageSmooth src="/auth/login.webp" />
        ) : (
          <ImageSmooth src="/auth/register.webp" />
        )}
      </div>
    </section>
  );
};

export default AuthForm;
