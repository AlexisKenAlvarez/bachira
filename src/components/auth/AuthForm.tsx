"use client";
import ImageSmooth from "@/components/shared/ImageSmooth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SignInButton,
  SignUpButton,
  useSignIn,
  useSignUp,
} from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Link from "next/link";
import MyLoader from "../shared/Loader";
import CustomVerify from "./CustomVerify";
import { Github, Loader } from "lucide-react";
import { api } from "@/trpc/react";

interface AuthPageProps {
  type: "sign in" | "sign up";
}

const AuthForm = ({ type }: AuthPageProps) => {
  const mySignup = useSignUp();
  const mySignin = useSignIn();
  const router = useRouter();

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

  const signupSubmit = async (data: authType) => {
    if (!mySignup.isLoaded) {
      return;
    }

    try {
      const formData = secondCredentialForm.getValues();

      console.log(formData);

      await mySignup.signUp?.create({
        emailAddress: data.email,
        password: data.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      console.log(mySignup);

      await mySignup.signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setNeedsUsername(false);
      setPendingVerification(true);
    } catch (err) {
      setDebounce(false);

      const error = JSON.parse(JSON.stringify(err, null, 2));
      const errorMessage = error.errors[0].longMessage;
      const paramName = error.errors[0].meta.paramName;
      console.log(error);
      if (paramName === "email_address") {
        authForm.setError("email", {
          type: "custom",
          message: errorMessage,
        });
        setNeedsUsername(false);
      } else if (paramName === "username") {
        secondCredentialForm.setError("username", {
          type: "custom",
          message: errorMessage,
        });
      } else {
        authForm.setError("password", {
          type: "custom",
          message: errorMessage,
        });
      }
    }
  };

  const signinSubmit = async (data: authType) => {
    if (!mySignin.isLoaded) {
      return;
    }

    try {
      const result = await mySignin.signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await mySignin.setActive({ session: result.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setDebounce(false);
      const error = err.errors[0];
      console.log(error);
      if (error.meta.paramName === "identifier") {
        authForm.setError("email", {
          type: "custom",
          message: error.longMessage,
        });
      } else {
        authForm.setError("password", {
          type: "custom",
          message: error.longMessage,
        });
      }
    }
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
          setDebounce(false);
          return;
        } else {
          setNeedsUsername(true);
          setSignupData(data);
        }
      } else {
        await signinSubmit(data);
      }
    }
  };

  const signInWith = (strategy: OAuthStrategy) => {
    try {
      if (type === "sign in") {
        return mySignin.signIn?.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      } else {
        return mySignup.signUp?.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        });
      }
    } catch (err) {
      const error = JSON.stringify(err, null, 2);

      console.log(error);
    }
  };

  // If the user has an account in your application, but does not yet
  // have an oauth account connected, you can use the transfer method to
  // forward that information.

  const userExistsButNeedsToSignIn =
    mySignup.signUp?.verifications.externalAccount.status === "transferable" &&
    mySignup.signUp?.verifications.externalAccount.error?.code ===
      "external_account_exists";

  const existingSignin = async () => {
    try {
      if (!mySignin.isLoaded) {
        return;
      }

      if (userExistsButNeedsToSignIn) {
        const result = await mySignin.signIn?.create({ transfer: true });
        setStayLoading(true);

        if (result.status === "complete") {
          await mySignin.setActive({ session: result.createdSessionId });
          router.push("/");
        }
      }
    } catch (err: any) {
      const error = JSON.stringify(err, null, 2);

      console.log(error);
    }
  };

  // If the user has an existing oauth account but does not yet exist as
  // a user in your app, you can use the transfer method to forward that
  // information.

  const userNeedsToBeCreated =
    mySignin.signIn?.firstFactorVerification.status === "transferable";

  console.log(mySignin.signIn);

  const oAuthExisting = async () => {
    try {
      if (!mySignup.isLoaded) {
        return;
      }

      if (userNeedsToBeCreated) {
        setStayLoading(true);
        const result = await mySignup.signUp?.create({
          transfer: true,
        });

        setStayLoading(false);

        if (result.status === "missing_requirements") {
          setNeedsTransfer(true);
        }

        if (result.status === "complete") {
          await mySignup.setActive({ session: result.createdSessionId });
        }
      }
    } catch (err: any) {
      const error = JSON.stringify(err, null, 2);

      console.log(error);
    }
  };

  const updateUsername = async ({ data }: { data: usernameType }) => {
    if (!userDebounce) {
      setUserDebounce(true);
      try {
        if (!mySignup.isLoaded) {
          return;
        }

        const result = await mySignup.signUp?.update({
          username: data?.username,
        });

        if (result.status === "complete") {
          setStayLoading(true);

          const userData = {
            id: result.createdUserId!,
            image: null,
            bio: null,
            username: result.username!,
            email: result.emailAddress!,
            firstName: result.firstName!,
            lastName: result.lastName!,
          };

          await addUser.mutateAsync(userData);

          await mySignup.setActive({ session: result.createdSessionId });
          router.push("/");
        }

        setUserDebounce(false);
      } catch (err) {
        const error = JSON.parse(JSON.stringify(err, null, 2));
        // const errMessage = error.errors[0].longMessage;
        setUserDebounce(false);
        // usernameForm.setError("username", {
        //   message: errMessage,
        //   type: "custom",
        // });
        console.log(error);
      }
    }
  };

  useEffect(() => {
    existingSignin();
    oAuthExisting();
  }, [mySignin]);

  // If the user has an existing oauth account but does not yet exist as
  // a user in your app, you can use the transfer method to forward that
  // information.

  if (!mySignin.isLoaded || stayLoading) {
    return <MyLoader />;
  }

  return (
    <section className="sm:bg-bggrey flex h-auto min-h-screen w-full bg-white pb-20 sm:pb-0">
      <div className="w-full place-content-center sm:grid">
        {pending ? (
          type === "sign up" ? (
            <CustomVerify />
          ) : null
        ) : mySignup.signUp?.missingFields[0] === "username" ||
          needsUsername ||
          transferSignup ? (
          <div className="h-full sm:rounded-xl sm:shadow-md">
            <div className="sm:min-h-20 font-secondary flex w-full flex-col space-y-4 bg-white px-7 py-10 sm:w-[26rem] sm:rounded-xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Enter username</h1>
                <h2 className="">
                  Provide a username to complete your registration
                </h2>
              </div>

              {!needsUsername ? (
                <div className="">
                  <Form {...usernameForm} key="first-form">
                    <form
                      key="first-form"
                      onSubmit={usernameForm.handleSubmit((data) =>
                        updateUsername({ data }),
                      )}
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
              ) : (
                <div className="">
                  <Form {...secondCredentialForm} key="second-form">
                    <form
                      key="second-form"
                      onSubmit={handleSubmit2(async () => {
                        await signupSubmit(signupData!);
                      })}
                      className="flex flex-col gap-4"
                    >
                      <FormField
                        control={control2}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Username{" "}
                              <span>
                                {secondCredentialForm.formState.errors
                                  .username &&
                                  ` - ${secondCredentialForm.formState.errors.username.message}`}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                                key="second-username"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control2}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              First name{" "}
                              <span>
                                {secondCredentialForm.formState.errors
                                  .firstName &&
                                  ` - ${secondCredentialForm.formState.errors.firstName.message}`}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Juan"
                                className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control2}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Last name{" "}
                              <span>
                                {secondCredentialForm.formState.errors
                                  .lastName &&
                                  ` - ${secondCredentialForm.formState.errors.lastName.message}`}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Dela Cruz"
                                className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
                                {...field}
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
              )}
            </div>
          </div>
        ) : (
          <div className="h-full sm:rounded-xl sm:shadow-md">
            <div className="sm:min-h-20 font-secondary flex w-full flex-col space-y-4 bg-white px-7 py-10 sm:w-[26rem] sm:rounded-xl">
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
                    signInWith("oauth_google");
                  }}
                >
                  <svg
                  
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 block absolute left-2"
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
                    {type.charAt(0).toUpperCase() + type.slice(1)} with
                    Google
                  </p>
                </Button>
                <Button
                  variant="outline"
                  className="relative w-full py-5"
                  onClick={async () => {
                    await signInWith("oauth_github");
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
            <div className="font-secondary sm:bg-bggrey flex items-center justify-center gap-[5px] bg-white px-7 text-center text-sm sm:rounded-xl sm:py-6">
              <p className="">
                {type === "sign in"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>

              {type === "sign up" ? (
                <SignInButton>
                  <button>
                    <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
                      Sign in
                    </p>
                  </button>
                </SignInButton>
              ) : (
                <SignUpButton>
                  <button>
                    <p className="cursor-pointer font-semibold text-blue-500 hover:underline">
                      Sign up
                    </p>
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="relative hidden w-full overflow-hidden lg:block">
        <Link href="/">
          <h1 className="transition-text font-primary absolute right-0 top-0 z-10 m-auto h-fit text-[12rem] text-white/20 duration-300 ease-in-out hover:text-white/50 xl:text-[15rem]">
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
