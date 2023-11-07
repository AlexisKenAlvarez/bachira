
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await getServerSession();

  if (!session || !session?.user) {
    redirect("/api/auth/signin");
  }

  console.log(session);

  return (
    <div>
      Enter
    </div>
  );
}

export default page;