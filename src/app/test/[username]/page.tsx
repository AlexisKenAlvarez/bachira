
type Props = {
  params: { username: string };
};

export function generateMetadata({ params }: Props) {


  const username = params.username;

  return {
    title: "Bachira",
    description: "Say more with Bachira",
    openGraph: {
      title: "Bachira",
      description: "Say more with Bachira",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}api/og?username=${username}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bachira",
      description: "Say more with Bachira",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}api/og?username=${username}`,
        },
      ],
    },
  };
}

const page = () => {
  return <div>Hello</div>;
};

export default page;
