import { MutationCtx, query, QueryCtx } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) {
      throw new ConvexError("unauthrized");
    }

    const currentUser = await getUserByClerkId({ ctx, clerkId: id.subject });

    if (!currentUser) {
      throw new ConvexError("user not found");
    }

    const conversationMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const conversations = await Promise.all(
      conversationMembers?.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);

        if (!conversation) {
          throw new ConvexError("conversation could not be found");
        }
        return conversation;
      })
    );

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation, index) => {
        const allConversationMembeship = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();


        const lastMessage = await getLastMessageDetails({ctx, id: conversation.lastMessageId})

        const lastSeenMessage = conversationMembers[index].lastSeenMessage ? await ctx.db.get(conversationMembers[index].lastSeenMessage!) : null


        const lastSeenMessageTime = lastSeenMessage ? lastSeenMessage._creationTime : -1

          const unseenMessages = await ctx.db.query("messages").withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id)).filter((q) => q.gt(q.field("_creationTime"), lastSeenMessageTime)).filter((q) => q.not(q.eq(q.field("senderId"), currentUser._id))).collect();

        if (conversation.isGroup) {
          return { conversation , lastMessage ,unseenCount: unseenMessages.length};
        } else {
          const otherMembership = allConversationMembeship.filter(
            (membership) => {
              return membership.memberId !== currentUser._id;
            }
          )[0];
          const otherMembers = await ctx.db.get(otherMembership.memberId);

          return { otherMembers, conversation, lastMessage,unseenCount: unseenMessages.length };
        }
      })
    );
    return conversationsWithDetails;
  },
});


const getLastMessageDetails = async ({ctx,id} : {ctx:QueryCtx | MutationCtx,id: Id<"messages"> | undefined}) => {
  if (!id) return null

  const message = await ctx.db.get(id);
  if (!message) return null

  const sender = await ctx.db.get(message.senderId);
  if (!sender) {
    throw new ConvexError("sender not found");
  }

  const content =  getMessageContent(message.type, message.content as unknown as string)

  return {content, sender: sender.username};
}


const getMessageContent = (type: string, content: string) => {
  switch (type) {
    case "text":
      return content;
    default:
      return "[Non-text]";
  }
}