"use client";

import ImageSmooth from "@/components/shared/ImageSmooth";
import { Button } from "@/ui/button";
import { Github } from "lucide-react";
import { supabase } from "@/supabase/supabaseClient";

interface AuthPageProps {
  type: "sign in" | "sign up";
}

const AuthForm = ({ type }: AuthPageProps) => {

  return (
    <section className="flex h-auto min-h-screen w-full bg-white pb-20 sm:bg-bggrey sm:pb-0">
      <ImageSmooth
        src="/background.jpg"
        className="absolute left-0 top-0 hidden h-full w-full object-cover sm:block"
      />
      <div className="z-10 w-full place-content-center sm:grid">
        <div className="h-full sm:rounded-xl sm:shadow-md">
          <div className="flex w-full flex-col space-y-4 bg-white px-7 py-8 font-primary sm:min-h-20 sm:w-[26rem] sm:rounded-tl-xl sm:rounded-tr-xl">
            <div className=" text-center">
              <h1 className="text-2xl font-bold">
                {type === "sign in"
                  ? "Welcome back to Bachira"
                  : "Create your account"}{" "}
              </h1>
              <p className="text-black/70">
                {type === "sign in"
                  ? "Login to your account and experience the social media built on NextJS."
                  : "Create an account and start socializing."}
              </p>
            </div>

            <div className="oauth flex flex-col gap-3">
              <Button
                variant="outline"
                className="relative w-full py-5"
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `/auth/callback`,
                    },
                  })

                  if (error) {
                    console.log(error)
                    return
                  }
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
                onClick={async () => {
                  const { data } = await supabase.auth.signInWithOAuth({
                    provider: "github",
                  })

                  console.log(data);
                }}
              >
                <Github className="absolute left-2 text-2xl" />
                <p className="font-semibold">
                  {type.charAt(0).toUpperCase() + type.slice(1)} with Github
                </p>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-[5px] bg-white px-7 text-center font-primary text-sm sm:rounded-bl-xl sm:rounded-br-xl sm:bg-bggrey sm:py-6">
            <p className="">
              Make sure you agree to our{" "}
              <span className="text-blue-500 cursor-pointer font-semibold hover:underline">
                Terms and Conditions
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-10 hidden w-full items-center overflow-hidden lg:flex">
        <div className="">
          <h1 className="block h-fit text-9xl font-bold">Bachira</h1>
          <p className="text-xl">
            Sign in now to experience the best social media in the world.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuthForm;
