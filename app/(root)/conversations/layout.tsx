"use client";

import ItemList from "@/components/shared/item-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import React from "react";
import DMConversationItem from "./_components/DMConversationItem";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupConversation from "./_components/GroupConversation";

type Props = React.PropsWithChildren<{}>;

const Conversationslayout = ({ children }: Props) => {
  const conversations = useQuery(api.conversations.get);
  return (
    <>
      <ItemList title="conversation" action={<CreateGroupDialog />}>
        {conversations ? (
          conversations.length === 0 ? (
            <p className="w-full h-full flex items-center justify-center">
              no conversation found
            </p>
          ) : (
            conversations.map((conversations) => {
              return conversations.conversation.isGroup ?
               <GroupConversation
              key={conversations.conversation._id}
              id={conversations.conversation._id}
              name={conversations.conversation.name || ""}
              lastMessageSender={conversations.lastMessage?.sender}
              lastMessageContent={conversations.lastMessage?.content}
            /> : (
                <DMConversationItem
                  key={conversations.conversation._id}
                  id={conversations.conversation._id}
                  imageUrl={conversations.otherMembers?.imageUrl || ""}
                  usrename={conversations.otherMembers?.username || ""}
                  lastMessageSender={conversations.lastMessage?.sender}
                  lastMessageContent={conversations.lastMessage?.content}
                />
              );
            })
          )
        ) : (
          <Loader2 className="" />
        )}
      </ItemList>
      {children}
    </>
  );
};

export default Conversationslayout;
