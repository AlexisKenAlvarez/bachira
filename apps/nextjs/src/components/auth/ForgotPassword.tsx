// "use client";
// import ImageSmooth from "@/components/shared/ImageSmooth";
// import { Button } from "@/components/ui/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Loader } from "lucide-react";

// const ForgotPassword = () => {
//   const [debounce, setDebounce] = useState(false);
//   const [successfulCreation, setSuccessfulCreation] = useState(false);

//   const emailSchema = z.object({
//     email: z.string().email(),
//   });

//   const resetSchema = z
//     .object({
//       password: z
//         .string()
//         .min(8, "Must be 8 characters or more")
//         .max(20, "Must not be more than 20 characters"),
//       confirmPassword: z
//         .string()
//         .min(8, "Must be 8 characters or more")
//         .max(20, "Must not be more than 20 characters"),
//       code: z.string(),
//     })
//     .refine((data) => data.password === data.confirmPassword, {
//       message: "Passwords does not match.",
//       path: ["confirmPassword"], // path of error
//     });

//   type emailType = z.infer<typeof emailSchema>;
//   type resetType = z.infer<typeof resetSchema>;

//   const form = useForm<emailType>({
//     resolver: zodResolver(emailSchema),
//     defaultValues: {
//       email: "",
//     },
//   });

//   const form2 = useForm<resetType>({
//     resolver: zodResolver(resetSchema),
//     defaultValues: {
//       password: "",
//       confirmPassword: "",
//       code: "",
//     },
//   });

//   const emailSubmit = (data: emailType) => {
//     if (!debounce) {
//       setDebounce(true);
//       // SEND CODE FOR RESET
//       setDebounce(false);
//     }
//   };

//   const resetPassword = (data: resetType) => {
//     if (!debounce) {
//       setDebounce(true);
//       // RESET PASSWORD
//     }
//   };

//   return (
//     <section className="sm:bg-bggrey flex h-auto min-h-screen w-full bg-white pb-20 sm:pb-0">
//       <div className="w-full place-content-center sm:grid">
//         <div className="h-full sm:rounded-xl sm:shadow-md">
//           <div className="sm:min-h-20 font-secondary w-full bg-white px-7 py-10 sm:w-[26rem] sm:rounded-xl">
//             <div className=" text-center">
//               <h1 className="text-2xl font-bold">Reset your password</h1>
//               <p className="text-sm text-black/70">
//                 {successfulCreation
//                   ? "A strong password helps your account to be secured."
//                   : "Please enter the email of the account that you want to reset the password."}
//               </p>
//             </div>

//             {successfulCreation ? (
//               <Form {...form2}>
//                 <form
//                   onSubmit={form2.handleSubmit(resetPassword)}
//                   className="mt-5 flex flex-col gap-4"
//                 >
//                   <FormField
//                     control={form2.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem className="m-0 gap-0">
//                         <FormLabel className="m-0 py-0">
//                           Password
//                           <span>
//                             {" "}
//                             {form2.formState.errors.password
//                               ? ` - ${form2.formState.errors.password.message}`
//                               : null}
//                           </span>
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Enter your password"
//                             className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
//                             type="password"
//                             {...field}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form2.control}
//                     name="confirmPassword"
//                     render={({ field }) => (
//                       <FormItem className="m-0 gap-0">
//                         <FormLabel className="m-0 py-0">
//                           Confirm Password
//                           <span>
//                             {" "}
//                             {form2.formState.errors.confirmPassword
//                               ? ` - ${form2.formState.errors.confirmPassword.message}`
//                               : null}
//                           </span>
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Re-type your password"
//                             className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
//                             type="password"
//                             {...field}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form2.control}
//                     name="code"
//                     render={({ field }) => (
//                       <FormItem className="m-0 gap-0">
//                         <FormLabel className="m-0 py-0">
//                           6-Digit Code
//                           <span>
//                             {" "}
//                             {form2.formState.errors.code
//                               ? ` - ${form2.formState.errors.code.message}`
//                               : null}
//                           </span>
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Enter the 6 digit code"
//                             className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
//                             type="text"
//                             {...field}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />

//                   <Button className="mt-2 w-full bg-black">
//                     {debounce ? (
//                       <Loader className="animate-spin text-lg " />
//                     ) : (
//                       "Change password"
//                     )}
//                   </Button>
//                 </form>
//               </Form>
//             ) : (
//               <Form {...form}>
//                 <form
//                   onSubmit={form.handleSubmit(emailSubmit)}
//                   className="mt-4"
//                   key="Send Forgot"
//                 >
//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem className="m-0 gap-0">
//                         <FormLabel className="m-0 py-0">
//                           <span>
//                             {" "}
//                             {form.formState.errors.email
//                               ? `${form.formState.errors.email.message}`
//                               : null}
//                           </span>
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="sample@smdl.com"
//                             className="focus-visible:ring-none !mt-[4px] focus-visible:border-blue-200 focus-visible:ring-transparent"
//                             {...field}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <Button className="mt-5 w-full bg-black">
//                     {debounce ? (
//                       <Loader className="animate-spin text-lg " />
//                     ) : (
//                       "Submit"
//                     )}
//                   </Button>
//                   <button
//                     className="mx-auto block w-fit"
//                     onClick={() => setSuccessfulCreation(true)}
//                   >
//                     <p className="mt-2 text-center text-sm hover:underline">
//                       Already have code?
//                     </p>
//                   </button>
//                 </form>
//               </Form>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="relative hidden w-full overflow-hidden lg:block">
//         <Link href="/">
//           <h1 className="transition-text font-primary absolute right-0 top-0 z-10 m-auto h-fit text-[12rem] text-white/20 duration-300 ease-in-out hover:text-white/50 xl:text-[15rem]">
//             SMDL
//           </h1>
//         </Link>

//         <ImageSmooth src="/auth/login.webp" />
//       </div>
//     </section>
//   );
// };

// export default ForgotPassword;
'use client'
const ForgotPassword = () => {
  return (
    <div>
      Enter
    </div>
  );
}

export default ForgotPassword;