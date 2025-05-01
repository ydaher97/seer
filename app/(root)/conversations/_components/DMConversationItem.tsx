import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getRandomAvatar, getAvatarFallback } from "@/lib/utils/avatar";

type Props = {
  id: Id<"conversations">;
  imageUrl: string;
  usrename: string;
  lastMessageSender?: string;
  lastMessageContent?: string;
};

const DMConversationItem = ({ id, imageUrl, usrename , lastMessageContent , lastMessageSender }: Props) => {
  return (
    <Link href={`/conversations/${id}`} className="w-full">
      <Card className="p-2 flex flex-row items-center gap-4 truncate">
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarImage src={getRandomAvatar(usrename)} />
            <AvatarFallback>
              {getAvatarFallback(usrename)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{usrename}</h4>
            {lastMessageContent && lastMessageContent ? <span className="text-sm text-muted-foreground truncate flex overflow-ellipsis"><p className="font-semibold"> {lastMessageSender} {":"}&nbsp;
              </p>
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

export default DMConversationItem;
