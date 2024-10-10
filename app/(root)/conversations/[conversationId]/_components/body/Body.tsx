import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConversation } from "@/hooks/useConversation";
import { useQuery } from "convex/react";
import React, { useEffect } from "react";
import Message from "./Message";
import { useMutatoinState } from "@/hooks/useMutationState";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  members: {
    lastSeenMessageId?: Id<"messages">
    username?: string;
    [key: string]: any;
  }[]
};

const Body = ({members}: Props) => {

  const {conversationId} = useConversation()

  const messages  = useQuery(api.messages.get, {
    conversationId: conversationId as Id<"conversations">
  })

  const {mutate: markRead} = useMutatoinState(api.conversation.markRead)

  useEffect(() => {
    if(messages && messages.length > 0) {
      markRead({
        conversationId,
        messageId:messages[0].message._id
      })
    }
  }, [messages?.length, conversationId, markRead])

  const getSeenMessages = (messageId: Id<"messages">) =>{
    const seenUsers = members.filter((member) => member.lastSeenMessageId === messageId).map(user => user.username!.split(" ")[0])

    if(seenUsers.length === 0) {
      return undefined
    }
    return formatSeenBy(seenUsers)
  
  }

  const formatSeenBy = (names: string[]) => {
    switch(names.length) {
      case 1:
        return <p className="text-muted-foreground text-sm text-right">
          {`seen by ${names[0]}`}
        </p>

      case 2:
        return <p className="text-muted-foreground text-sm text-right">
          {`seen by ${names[0]} and ${names[1]}`}
        </p>
      default:
        return <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
            <p className="text-muted-foreground text-sm text-right">
              {`seen by ${names[0]} and ${names[1]} and ${names.length - 2} others`}
            </p>
            </TooltipTrigger>
            <ul>
              {names.map((name, index) => {
                return <li key={index}>{name}</li>
              })}
            </ul>
          </Tooltip>
        </TooltipProvider>
    }
  }

  return (
    <div className="flex-1 w-full flex overflow-y-scroll flex-col-reverse gap-2 p-3 scrollbar">
      {messages?.map(({message, senderImage,senderName, isCurrentUser}, index) => {

         const lastByUser = messages[index - 1 ]?.message.senderId === messages[index].message.senderId;

         const seenMessage = isCurrentUser ? getSeenMessages(message._id) : undefined

         return <Message key={message._id} formCurrentUser={isCurrentUser} senderImage={senderImage} senderName={senderName} content={message.content} lastByUser={lastByUser} type={message.type} createdAt={message._creationTime}
         seen={seenMessage}/>
      })}
    </div>
  );
};

export default Body;
// function useMutationState(conversations: { get: import("convex/server").FunctionReference<"query", "public", {}, ({ conversation: { _id: import("convex/values").GenericId<"conversations">; _creationTime: number; name?: string | undefined; lastMessageId?: import("convex/values").GenericId<"messages"> | undefined; isQroup: boolean; }; lastMessage: { content: string; sender: string; } | null; otherMembers?: undefined; } | { otherMembers: { _id: import("convex/values").GenericId<"users">; _creationTime: number; username: string; imageUrl: string; clerkId: string; email: string; } | null; conversation: { _id: import("convex/values").GenericId<"conversations">; _creationTime: number; name?: string | undefined; lastMessageId?: import("convex/values").GenericId<"messages"> | undefined; isQroup: boolean; }; lastMessage: { content: string; sender: string; } | null; })[]>; }): { mutate: any; } {
//   throw new Error("Function not implemented.");
// }

