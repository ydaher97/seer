import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Map, MessagesSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const useNavigation = () => {
  const pathname = usePathname();
  const requestsCount = useQuery(api.requests.count);

  const conversation = useQuery(api.conversations.get)

  const unseenMessagesCount = useMemo(() => {
      return conversation?.reduce((acc, curr) => {
        return acc + curr.unseenCount
      }, 0)
  }, [conversation])


  const paths = useMemo(
    () => [
      {
        name: "Conversations",
        href: "conversations",
        icon: <MessagesSquare />,
        active: pathname.startsWith("/conversations"),
        count: unseenMessagesCount,
      },
      // {
      //   name: "friends",
      //   href: "friends",
      //   icon: <Users />,
      //   active: pathname.startsWith("/friends"),
      //   count: requestsCount,
      // },
      {
        name: "Map",
        href: "map",
        icon: <Map />,
        active: pathname.startsWith("/map"),
      },
    ],
    [pathname, unseenMessagesCount]
  );
  return paths;
};
