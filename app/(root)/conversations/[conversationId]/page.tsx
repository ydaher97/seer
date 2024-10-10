"use client";
import ConversationContainer from "@/components/shared/conversation/ConversationContainer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import React from "react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import RemaoveFriendDialog from "./_components/dialogs/RemaoveFriendDialog";
import DeleteGroupDialog from "./_components/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/dialogs/LeaveGroupDialog";

type Props = {
  params: {
    conversationId: Id<"conversations">;
  };
};

const Conversationpage = ({ params: { conversationId } }: Props) => {
  const conversation = useQuery(api.conversation.get, { id: conversationId });

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = React.useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = React.useState(false);

  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = React.useState(false);

  const [callType, setCallType] = React.useState<"audio" | "video" | null>(null);

  return conversation === undefined ? (
    <div className="w-full h-full flex items-center">
      <Loader2 className="h-8 w-8" />
    </div>
  ) : conversation === null ? (
    <p className="w-full h-full flex items-center">Conversation not found</p>
  ) : (
    <ConversationContainer>
      <RemaoveFriendDialog conversationId={conversationId} open={removeFriendDialogOpen} setOpen={setRemoveFriendDialogOpen}/>
      <DeleteGroupDialog conversationId={conversationId} open={deleteGroupDialogOpen} setOpen={setDeleteGroupDialogOpen}/>
      <LeaveGroupDialog conversationId={conversationId} open={leaveGroupDialogOpen} setOpen={setLeaveGroupDialogOpen}/>
      <Header
        name={
          (conversation.isGroup
            ? conversation.name
            : conversation.otherMember?.username) || ""
        }
        imageUrl={
          conversation.isGroup ? undefined : conversation.otherMember?.imageUrl
        }
        options={conversation.isGroup ? [{
          label: "Leave Group",
          destructive: false,
          onClick: () => setLeaveGroupDialogOpen(true),
        },
        {
          label: "Delete Group",
          destructive: true,
          onClick: () => setDeleteGroupDialogOpen(true),
        }
    ] : [
      {
        label: "Remove Friend",
        destructive: true,
        onClick: () => setRemoveFriendDialogOpen(true),
      }
    ]}
      />
      <Body members={conversation.isGroup ? conversation.otherMembers ? conversation.otherMembers : [] : conversation.otherMember ? [conversation.otherMember] : []} />
      <ChatInput />
    </ConversationContainer>
  );
};

export default Conversationpage;
