import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  id: Id<"conversations">;
  name: string;
  lastMessageSender?: string;
  lastMessageContent?: string;
};

const GroupConversation = ({ id,  name , lastMessageContent , lastMessageSender }: Props) => {
  console.log(name);
  return (
    <Link href={`/conversations/${id}`} className="w-full">
      <Card className="p-2 flex flex-row items-center gap-4 truncate">
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarFallback>
              {name.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>
            {lastMessageContent && lastMessageContent ? <span className="text-sm text-muted-foreground truncate flex overflow-ellipsis">
              {/* <p className="font-semibold"> {lastMessageSender} {":"}&nbsp;
              </p> */}
              <p className="truncate overflow-ellipsis">
                {lastMessageContent}
              </p>
              </span> :<p className="text-sm text-muted-foreground truncate ">
              start a conversation
            </p>}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default GroupConversation;
