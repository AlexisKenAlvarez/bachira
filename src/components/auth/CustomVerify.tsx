import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { signupType } from "@/lib/zodSchema";
import { Loader } from "lucide-react";
import { api } from "@/trpc/react";

const CustomVerify = () => {
  const router = useRouter();
  const mySignup = useSignUp();
  const [digits, setDigits] = useState([0, 0, 0, 0, 0, 0]);
  const [error, setError] = useState<string | null>(null);
  const [debounce, setDebounce] = useState(false);
  const addUser = api.user.addUser.useMutation({
    onSettled: () => {
      console.log("User has been added");
    },
  });

  const autoTab = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const tabIndex = e.currentTarget.tabIndex;
    setTimeout(() => {
      if (e.key === "Backspace") {
        const decrement = tabIndex === 0 ? 0 : tabIndex - 1;
        const nextInput = document.querySelector(
          `[tabindex="${decrement}"]`,
        ) as HTMLInputElement;

        nextInput.focus();
      } else if (!isNaN(parseInt(e.key))) {
        const increment = tabIndex === 5 ? 5 : tabIndex + 1;

        const nextInput = document.querySelector(
          `[tabindex="${increment}"]`,
        ) as HTMLInputElement;

        nextInput.focus();
      }
    }, 10);
  };

  const handleValue = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const digitsCopy = [...digits];
    digitsCopy[i] = parseInt(e.target.value);

    setDigits(digitsCopy);
  };

  // This verifies the user using email code that is delivered.
  const signupVerify = async () => {
    if (!mySignup.isLoaded) {
      return;
    }

    try {
      const completeSignUp =
        await mySignup.signUp.attemptEmailAddressVerification({
          code: digits.toString().replaceAll(",", ""),
        });


      if (completeSignUp.status !== "complete") {
        /*  investigate the response, to see if there was an error
         or if the user needs to complete more steps.*/
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        const userData: signupType = {
          id: completeSignUp.createdUserId!,
          username: completeSignUp.username!,
          email: completeSignUp.emailAddress!,
          firstName: completeSignUp.firstName!,
          lastName: completeSignUp.lastName!,
        };

        await addUser.mutateAsync(userData);

        await mySignup.setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err) {
      console.log(err);
      const error = JSON.parse(JSON.stringify(err, null, 2));
      setDebounce(false);

      setError(error.errors[0].longMessage);
    }
  };

  const onPressVerify = async () => {
    if (!debounce) {
      setDebounce(true);
      await signupVerify();
    }
  };

  return (
    <div className="h-full sm:rounded-xl sm:shadow-md">
      <div className="sm:min-h-20 w-full bg-white px-7 py-10 font-secondary sm:w-[26rem] sm:rounded-xl">
        <div className=" text-center">
          <h1 className="text-2xl font-bold">Enter verification code</h1>
          <p className="text-sm text-black/70">
            Please enter the 6 digit verification code that we sent to your
            email.
          </p>
        </div>

        <div className="mx-auto w-fit">
          <div className="mt-4 flex items-center justify-center gap-2">
            {digits.map((_, i) => (
              <Input
                key={i}
                tabIndex={i}
                onKeyDown={autoTab}
                onChange={(e) => {
                  handleValue(e, i);
                }}
                type="tel"
                maxLength={1}
                autoComplete="false"
                className="focus-visible:ring-none !mt-[4px] h-12 w-12 text-center text-lg font-bold focus-visible:border-blue-200  focus-visible:ring-transparent"
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}

          <Button className="mt-5 w-full bg-black" onClick={onPressVerify}>
            {debounce ? (
              <Loader className="animate-spin text-lg " />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomVerify;
