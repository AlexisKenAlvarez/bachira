"use client";
import { useClerk } from "@clerk/nextjs";

const LogoutButton = () => {
  const { signOut } = useClerk();
  return (
    <div>
      <p
        className=""
        onClick={async () => {
          await signOut();
        }}
      >
        Signout
      </p>
    </div>
  );
};

export default LogoutButton;
